import { Cursor, Types } from 'mongoose';
import { sortOrderEnum } from '../../shared/enums/query.enum';
import { BadRequestException, NotFoundException, UnAuthorizedException } from '../../shared/response/exception.response';
import { Id, IFile, IUserBody } from '../../shared/types';
import emailEvents from '../../utils/events/email.events';
import { io } from '../../utils/socket/socket.init';
import { deleteMultipleFromCloudinary, UploadResult, uploadResumeAttachment } from '../../utils/upload-files/cloudinary';
import { companyRepository } from '../company';
import jobRepository from '../job/job.repository';
import { selectGeneralUserInfo } from '../user';
import { ApplicationStatusEnum } from './application.enum';
import applicationRepository from './application.repository';
import { IApplication, IApplicationWData, IApplicationWUser } from './application.types';
import {
	IApplicationsQueryDTO,
	IExportCompanyApplicationsQueryDTO,
	IUpdateApplicationStatusDTO,
} from './application.validation';

class ApplicationServices {
	constructor(
		private readonly JobRepo = jobRepository,
		private readonly ApplicationRepo = applicationRepository,
		private readonly CompanyRepo = companyRepository,
	) {}

	async applyToJob(user: IUserBody, jobId: string, file: IFile): Promise<IApplication> {
		const job = await this.JobRepo.findById(jobId).exec();
		if (!job) {
			throw new NotFoundException('Job not found', 'applyToJob');
		}

		const company = await this.CompanyRepo.findById(job.companyId).lean().exec();
		if (!company) {
			throw new NotFoundException('Company not found', 'applyToJob');
		}

		if (job.closed) {
			throw new BadRequestException('Job is closed', 'applyToJob');
		}

		const AppId = new Types.ObjectId();
		let userCV: UploadResult | null = null;

		try {
			if (file) {
				userCV = await uploadResumeAttachment(file, user._id);
			}

			const application = await this.ApplicationRepo.create({
				_id: AppId,
				jobId: jobId,
				userId: user._id,
				userCV: userCV?.public_id && userCV?.public_id ? userCV : null,
				companyId: job.companyId,
			});

			const companyHRs = company.HRs.map((hr) => hr.toString());

			// TODO: Emit a socket event to notify the HR that a new application has been submitted
			io?.to(companyHRs.toString()).emit('application:newApply', {
				job: { jobId: application.jobId, jobTitle: job.jobTitle },
				user: {
					userId: user._id,
					name: user.firstName,
					lastName: user.lastName,
					email: user.email,
					avatar: user.avatar,
				},
				userCV: application.userCV,
			});
			return application;
		} catch (error) {
			console.error(error);
			if (userCV?.public_id && userCV?.public_id)
				await deleteMultipleFromCloudinary([{ ...userCV, resourceType: 'raw' }]);
			throw error;
		}
	}

	async updateApplicationStatus(
		user: IUserBody,
		applicationId: string,
		body: IUpdateApplicationStatusDTO,
	): Promise<IApplication> {
		const application = await this.ApplicationRepo.findById(applicationId).exec();
		if (!application) {
			throw new NotFoundException('Application not found', 'acceptApplication');
		}

		if (application.status === body.status) {
			throw new BadRequestException('Application already ' + body.status, 'acceptApplication');
		}

		const [company, job] = await Promise.all([
			this.CompanyRepo.findById(application.companyId).lean().exec(),
			this.JobRepo.findById(application.jobId).lean().exec(),
		]);
		if (!job) {
			throw new NotFoundException('Job not found', 'acceptApplication');
		}

		if (!company) {
			throw new NotFoundException('Company not found', 'acceptApplication');
		}

		const companyHRs = company.HRs.map((hr) => hr.toString());

		const userIdStr = user._id.toString();

		if (company.createdBy.toString() !== userIdStr && !companyHRs.includes(userIdStr)) {
			throw new UnAuthorizedException('You are not authorized to perform this action', 'acceptApplication');
		}

		// if (application.status === 'accepted') {
		// 	throw new BadRequestException('Application already accepted', 'acceptApplication');
		// }

		// if (application.status === 'rejected') {
		// 	throw new BadRequestException('Application already rejected', 'acceptApplication');
		// }

		const updatedApp = await this.ApplicationRepo.findByIdAndUpdate(applicationId, {
			status: body.status,
		})
			.lean()
			.populate<IApplicationWUser>({ path: 'userId', select: selectGeneralUserInfo })
			.exec();

		if (!updatedApp) {
			throw new NotFoundException('Application not found', 'acceptApplication');
		}

		// send email to user - accepted/rejected
		const eventName =
			updatedApp.status === ApplicationStatusEnum.ACCEPTED
				? 'application-accepted'
				: updatedApp.status === ApplicationStatusEnum.REJECTED && 'application-rejected';

		if (eventName) {
			console.log({ email: user.email, name: user.username });
			const candidate = updatedApp.userId;
			emailEvents.emitAsync(eventName, {
				email: candidate.email,
				name: candidate.username || user.firstName,
				jobTitle: job.jobTitle,
			});
		}

		return updatedApp;
	}

	async getJobApplications(userId: Id, jobId: string, { page = 1, limit = 10, order }: IApplicationsQueryDTO) {
		const job = await this.JobRepo.findById(jobId).lean().exec();
		if (!job) {
			throw new NotFoundException('Job not found', 'getJobApplications');
		}

		const company = await this.CompanyRepo.findById(job.companyId).lean().exec();
		if (!company) {
			throw new NotFoundException('Company not found', 'getJobApplications');
		}

		const companyHRs = company.HRs.map((hr) => hr.toString());

		if (company.createdBy.toString() !== userId.toString() && !companyHRs.includes(userId.toString())) {
			throw new UnAuthorizedException('You are not authorized to perform this action', 'getJobApplications');
		}

		const applications = await this.ApplicationRepo.find({ jobId })
			.lean()
			.sort({ createdAt: order === sortOrderEnum.ASC ? 1 : -1 })
			.paginate(page, limit)
			.populate<IApplicationWUser>([
				{
					path: 'candidate',
					select: selectGeneralUserInfo,
				},
			])
			.exec();

		return applications;
	}

	async exportCompanyApplications(
		userId: Id,
		companyId: string,
		query: IExportCompanyApplicationsQueryDTO,
	): Promise<Cursor<IApplicationWData>> {
		const company = await this.CompanyRepo.findById(companyId).lean().select('_id createdBy HRs').exec();
		if (!company) {
			throw new NotFoundException('Company not found', 'exportCompanyApplications');
		}

		const userIdStr = userId.toString();
		const isOwner = company.createdBy.toString() === userIdStr;
		const isHr = company.HRs?.some((hrId) => hrId.toString() === userIdStr);

		if (!isOwner && !isHr) {
			throw new UnAuthorizedException('You are not authorized to perform this action', 'exportCompanyApplications');
		}

		// day
		const targetDate = query.day ? new Date(query.day) : new Date();
		const startDay = new Date(targetDate);
		startDay.setUTCHours(0, 0, 0, 0);

		const endDay = new Date(targetDate);
		endDay.setUTCHours(23, 59, 59, 999);

		console.log('company._id', company._id);
		console.log('company', company);

		const applications = await this.ApplicationRepo.find({
			companyId: company._id,
			createdAt: { $gte: startDay, $lte: endDay },
		})
			.lean()
			.sort({ createdAt: query.order === sortOrderEnum.ASC ? 1 : -1 })
			.populate<IApplicationWData>([
				{ path: 'userId', select: selectGeneralUserInfo },
				{ path: 'jobId', select: 'jobTitle' },
			])
			// .exec();
			.cursor();

		return applications as Cursor<IApplicationWData>;
	}
}

export default new ApplicationServices();
