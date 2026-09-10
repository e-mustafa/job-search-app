import { QueryFilter } from 'mongoose';
import { sortOrderEnum } from '../../shared/enums/query.enum';
import { BadRequestException, NotFoundException, UnAuthorizedException } from '../../shared/response/exception.response';
import { Id, IPaginatedResult, IUserBody } from '../../shared/types';
import { IQueryDTO } from '../../shared/validation/general-fields.validation';
import { ICompany, selectGeneralCompanyInfo } from '../company';
import companyRepository from '../company/company.repository';
import { RoleEnum } from '../user/user.enums';
import jobRepository from './job.repository';
import { IJob, IJobWCompany } from './job.types';
import { ICreateJobDTO, IGetJobsQueryDTO, IUpdateJobDTO } from './job.validation';

class JobServices {
	constructor(
		private readonly JobRepo = jobRepository,
		private readonly CompanyRepo = companyRepository,
	) {}

	private buildJobQueryFilter = (query: IGetJobsQueryDTO): QueryFilter<IJob> => {
		const filter: Record<string, unknown>[] = [];
		const {
			search,
			jobTitle,
			jobLocation = [],
			workingTime = [],
			seniorityLevel = [],
			technicalSkills = [],
			softSkills = [],
		} = query || {};

		// 1. Handle Enum Filters with $in operator for multi-selection
		if (jobLocation?.length > 0) filter.push({ jobLocation: { $in: jobLocation } });
		if (workingTime?.length > 0) filter.push({ workingTime: { $in: workingTime } });
		if (seniorityLevel?.length > 0) filter.push({ seniorityLevel: { $in: seniorityLevel } });

		// 2. Handle Specific Skill Filters
		if (technicalSkills?.length > 0) filter.push({ technicalSkills: { $in: technicalSkills } });
		if (softSkills?.length > 0) filter.push({ softSkills: { $in: softSkills } });

		// 3. Handle Specific Job Title Filter
		if (jobTitle) filter.push({ jobTitle: { $regex: new RegExp(jobTitle, 'i') } });

		// 4. Handle Global Search across multiple fields
		if (search) {
			const searchRegex = new RegExp(search, 'i');

			if (search) {
				const searchRegex = new RegExp(search, 'i');
				filter.push({
					$or: [
						{ jobTitle: searchRegex },
						{ jobDescription: searchRegex },
						{ technicalSkills: searchRegex },
						{ softSkills: searchRegex },
					],
				});
			}
		}

		return filter.length > 0 ? { $and: filter } : {};
	};

	async createJob(userId: Id, companyId: Id, body: ICreateJobDTO) {
		const company = await this.CompanyRepo.findOne({ _id: companyId }).lean().exec();
		if (!company) {
			throw new NotFoundException('Company not found.', 'jobService.createJob');
		}

		const userIdStr = userId.toString();
		const isOwner = company.createdBy.toString() === userIdStr;
		const isHR = company.HRs.some((hr) => hr.toString() === userIdStr);

		if (!isOwner && !isHR) {
			throw new UnAuthorizedException(
				'You are not authorized to perform this action on this company',
				'jobService.createJob',
			);
		}

		const { jobTitle, jobLocation, workingTime, seniorityLevel, jobDescription, technicalSkills, softSkills } = body || {};

		const job = await this.JobRepo.create({
			jobTitle,
			jobLocation,
			workingTime,
			seniorityLevel,
			jobDescription,
			technicalSkills,
			softSkills,
			addedBy: userId,
			companyId,
		});
		return job;
	}

	async updateJob(userId: Id, jobId: Id, body: IUpdateJobDTO) {
		const job = await this.JobRepo.findOne({ _id: jobId, addedBy: userId }).lean().exec();
		if (!job) {
			throw new NotFoundException('Job not found, you are not authorized to update this job', 'jobService.updateJob');
		}

		const { jobTitle, jobLocation, workingTime, seniorityLevel, jobDescription, technicalSkills, softSkills } = body || {};

		const data: Partial<IJob> = { updatedBy: userId };

		if (jobTitle) data.jobTitle = jobTitle;
		if (jobLocation) data.jobLocation = jobLocation;
		if (workingTime) data.workingTime = workingTime;
		if (seniorityLevel) data.seniorityLevel = seniorityLevel;
		if (jobDescription) data.jobDescription = jobDescription;
		if (technicalSkills) data.technicalSkills = technicalSkills;
		if (softSkills) data.softSkills = softSkills;

		return await this.JobRepo.findByIdAndUpdate(jobId, data).lean().exec();
	}

	async deleteJob(userId: Id, jobId: string) {
		const job = await this.JobRepo.findOne({ _id: jobId }).lean().exec();
		if (!job) {
			throw new NotFoundException('Job not found.', 'jobService.deleteJob');
		}

		// check if user is authorized to update this job - only company owner can update this job
		const company = await this.CompanyRepo.findById(job.companyId).lean().select('createdBy HRs').exec();
		if (!company) {
			throw new NotFoundException('Company not found.', 'jobService.deleteJob');
		}

		const userIdStr = userId.toString();

		const isOwner = company.createdBy.toString() === userIdStr;
		const isHR = company.HRs.some((hr) => hr.toString() === userIdStr);

		if (!isOwner && !isHR) {
			throw new UnAuthorizedException('You are not authorized to perform this action on this company', 'jobService');
		}

		return await this.JobRepo.deleteOne({ _id: jobId });
	}

	async getJob(userId: Id, jobId: string) {
		const job = await this.JobRepo.findById(jobId).lean().exec();
		if (!job) {
			throw new NotFoundException('Job not found.', 'jobService.getJobById');
		}
		return job;
	}

	async getJobs(userId: Id, query: IGetJobsQueryDTO): Promise<IPaginatedResult<IJobWCompany>> {
		const { page = 1, limit = 10, order = sortOrderEnum.DESC, ...rest } = query || {};
		const filter: QueryFilter<IJob> = this.buildJobQueryFilter(rest);

		const jobs = await this.JobRepo.find(filter)
			.lean()
			.sort({ createdAt: order === sortOrderEnum.ASC ? 1 : -1 })
			.paginate(page, limit)
			// .select('companyName companyEmail description industry address numberOfEmployees website logo coverPic')
			.populate<IJobWCompany>({
				path: 'companyId',
				select: selectGeneralCompanyInfo,
			})
			.exec();

		return jobs; // as unknown as IPaginatedResult<ICompany>;
	}

	async getCompanyJobs(
		user: IUserBody,
		query: IQueryDTO,
		companyId: string,
		jobId: string,
	): Promise<{ data: IJob[] } | IPaginatedResult<IJob>> {
		const { page = 1, limit = 10, order, search } = query || {};
		const companyFilter: QueryFilter<ICompany> = {};
		if (companyId) {
			companyFilter._id = companyId;
		} else if (search?.trim()) {
			companyFilter.companyName = { $regex: search.trim(), $options: 'i' };
		} else {
			throw new BadRequestException('Please provide company id or search', 'jobService.getCompanyJobs');
		}

		const isAdmin = user.role === RoleEnum.ADMIN;

		const company = await this.CompanyRepo.findOne(companyFilter, { ignoreDefaultFilters: isAdmin }).lean().exec();
		if (!company) {
			throw new NotFoundException('There are no company matching your search', 'jobService.getCompanyJobs');
		}

		const jobFilter: QueryFilter<IJob> = { companyId: company._id };

		if (jobId) {
			const job = await this.JobRepo.findOne({ _id: jobId, companyId: company._id })
				.lean()
				.select(isAdmin ? '' : '-updatedBy -addedBy')
				.populate<IJobWCompany>({ path: 'companyId', select: selectGeneralCompanyInfo })
				.exec();

			if (!job) {
				throw new NotFoundException('Job not found for this company.', 'jobService.getCompanyJobs');
			}

			return { data: [job] };
		}

		const jobs = await this.JobRepo.find(jobFilter)
			.lean()
			.sort({ createdAt: order === sortOrderEnum.ASC ? 1 : -1 })
			.select(isAdmin ? '' : '-updatedBy -addedBy')
			.paginate(page, limit)
			.populate<IJobWCompany>({ path: 'companyId', select: selectGeneralCompanyInfo })
			.exec();

		return jobs;
	}
}

export default new JobServices();
