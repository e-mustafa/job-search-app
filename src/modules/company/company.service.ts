import { QueryFilter, Types } from 'mongoose';
import { sortOrderEnum } from '../../shared/enums/query.enum';
import { BadRequestException, NotFoundException, UnAuthorizedException } from '../../shared/response/exception.response';
import { Id, IFile, IImage, IPaginatedResult, IUserBody, TAttachment } from '../../shared/types';
import { IQueryDTO } from '../../shared/validation/general-fields.validation';
import cloudinary, {
	CloudinaryResourceType,
	deleteMultipleFromCloudinary,
	uploadCompanyAttachments,
} from '../../utils/upload-files/cloudinary';
import { RoleEnum } from '../user/user.enums';
import companyRepository, { CompanyRepository } from './company.repository';
import { ICompany, ICompanyWJobs } from './company.types';
import { ICreateCompanyDTO, IUpdateCompanyDTO } from './company.validation';

export const selectGeneralCompanyInfo =
	// '_id companyName companyEmail description industry address numberOfEmployees website logo coverPic ';
	'_id companyName companyEmail logo coverPic';

class CompanyServices {
	constructor(private readonly CompanyRepo: CompanyRepository = companyRepository) {}

	async getCompanies(user: IUserBody, query: IQueryDTO): Promise<IPaginatedResult<ICompany>> {
		const { page = 1, limit = 10, order = sortOrderEnum.DESC, search } = query || {};

		const filter: QueryFilter<ICompany> = {};

		if (search?.trim()) {
			filter.companyName = { $regex: search.trim(), $options: 'i' };
		}

		const isAdmin = user.role === RoleEnum.ADMIN;

		const companies = await this.CompanyRepo.find(filter, { ignoreDefaultFilters: isAdmin })
			.lean()
			.sort({ createdAt: order === sortOrderEnum.ASC ? 1 : -1 })
			.paginate(page, limit)
			.select('companyName companyEmail description industry address numberOfEmployees website logo coverPic')
			.exec();

		return companies; // as unknown as IPaginatedResult<ICompany>;
	}

	async getCompany(_userId: Id, companyId: string): Promise<ICompanyWJobs> {
		const company = await this.CompanyRepo.findById(companyId)
			.lean()
			.populate<ICompanyWJobs>({ path: 'jobs', select: '-addedBy -createdBy' })
			.exec();
		if (!company) {
			throw new NotFoundException('Company not found', 'companyService.getCompany');
		}
		return company;
	}

	async createCompany(userId: Id, body: ICreateCompanyDTO, file: IFile) {
		const { companyName, companyEmail, description, industry, address, numberOfEmployees, website, HRs = [] } = body || {};

		// active user (not banned or deleted) checked in auth middleware

		const existCompany = await this.CompanyRepo.findOne(
			{ $or: [{ companyEmail }, { companyName }] },
			{ ignoreDefaultFilters: true }, // include bannedAt, deletedAt
		)
			.lean()
			.exec();

		if (existCompany) {
			const existEmail = existCompany.companyEmail === companyEmail;
			throw new BadRequestException(
				`Company with this ${existEmail ? 'email' : 'name'} already exists`,
				'companyService.createCompany',
			);
		}

		const companyId = new Types.ObjectId();
		let attachments: TAttachment[] = [];
		try {
			if (file) {
				const uploadResults = await uploadCompanyAttachments([file], companyId);
				attachments = uploadResults?.map((file) => ({
					public_id: file.public_id,
					secure_url: file.secure_url,
					resourceType: file.resourceType,
				}));
			}

			const company = await this.CompanyRepo.create({
				_id: companyId,
				companyName,
				companyEmail,
				description,
				industry,
				address,
				numberOfEmployees,
				HRs,
				...(website ? { website } : {}),
				...(attachments.length > 0 && { legalAttachment: attachments[0] }),
				createdBy: userId,
				approvedByAdmin: false,
			});

			return company;
		} catch (error) {
			if (attachments.length > 0) await deleteMultipleFromCloudinary(attachments);
			throw error;
		}
	}

	async updateCompany(userId: Id, companyId: Id, body: IUpdateCompanyDTO) {
		const { companyName, companyEmail, description, industry, address, numberOfEmployees, website, HRs = [] } = body || {};

		const company = await this.CompanyRepo.findOne({ _id: companyId, createdBy: userId }).lean().exec();
		if (!company) {
			throw new NotFoundException(
				'Company not found or you are not authorized to update this company',
				'companyService.updateCompany',
			);
		}

		// if user is updating company's name or email, check if the new companyName or companyEmail already exists
		if (companyName && companyName !== company.companyName) {
			const existCompany = await this.CompanyRepo.findOne({ companyName }, { ignoreDefaultFilters: true }).lean().exec();
			if (existCompany) {
				throw new BadRequestException(`Company with this name already exists`, 'companyService.updateCompany');
			}
		}

		if (companyEmail && companyEmail !== company.companyEmail) {
			const existCompany = await this.CompanyRepo.findOne({ companyEmail }, { ignoreDefaultFilters: true }).lean().exec();
			if (existCompany) {
				throw new BadRequestException(`Company with this email already exists`, 'companyService.updateCompany');
			}
		}

		const updatedCompany = await this.CompanyRepo.findOneAndUpdate(
			{ _id: companyId, createdBy: userId },
			{ companyName, companyEmail, description, industry, address, numberOfEmployees, website, HRs },
		)
			.lean()
			.exec();

		return updatedCompany;
	}

	async deleteCompany(user: IUserBody, companyId: Id) {
		const company = await this.CompanyRepo.findOne({ _id: companyId }, { ignoreDefaultFilters: true }).lean().exec();
		if (!company) {
			throw new NotFoundException(
				'Company not found or you are not authorized to delete this company',
				'companyService.deleteCompany',
			);
		}

		const isOwner = company.createdBy.toString() === user._id.toString();

		if ((isOwner && company.bannedAt) || !isOwner || user.role !== RoleEnum.ADMIN) {
			throw new UnAuthorizedException('You are not authorized to delete this company', 'companyService.deleteCompany');
		}

		const deleted = await this.CompanyRepo.updateOne({ _id: companyId }, { deletedAt: new Date() });

		if (!deleted || deleted.modifiedCount === 0) {
			throw new BadRequestException('Failed to delete company', 'companyService.deleteCompany');
		}

		if (deleted.modifiedCount > 0) {
			const deletingFiles = [];
			if (company?.legalAttachment?.public_id) deletingFiles.push(company?.legalAttachment);
			if (company?.logo?.public_id)
				deletingFiles.push({ ...company?.logo, resourceType: 'image' as CloudinaryResourceType });
			if (company?.coverPic?.public_id)
				deletingFiles.push({ ...company?.coverPic, resourceType: 'image' as CloudinaryResourceType });
			if (deletingFiles.length > 0) await deleteMultipleFromCloudinary(deletingFiles);

			// delete related jobs in mongodb middleware
		}
		return true;
	}

	async uploadCompanyPic(userId: Id, companyId: Id, file: IFile) {
		const fieldname = file?.fieldname as 'logo' | 'coverPic';
		const company = await this.CompanyRepo.findOne({ _id: companyId, createdBy: userId }).lean().exec();
		if (!company) {
			throw new NotFoundException(
				'Company not found or you are not authorized to update this company',
				'companyService.uploadCompanyPic',
			);
		}

		const [image] = await uploadCompanyAttachments([file], companyId, fieldname);

		const updatedCompany = await this.CompanyRepo.findByIdAndUpdate(companyId, {
			[fieldname]: { public_id: image?.public_id, secure_url: image?.secure_url },
		})
			.lean()
			.select(fieldname)
			.exec();

		if (!updatedCompany) {
			throw new BadRequestException('Failed to upload image', 'companyService.uploadCompanyPic');
		}

		return updatedCompany as unknown as { [fieldname]: IImage };
	}

	async deleteCompanyPic(userId: Id, companyId: Id, fieldname: 'logo' | 'coverPic') {
		const company = await this.CompanyRepo.findOne({ _id: companyId, createdBy: userId }).lean().exec();
		if (!company) {
			throw new NotFoundException(
				'Company not found or you are not authorized to update this company',
				'companyService.deleteCompanyPic',
			);
		}

		if (!company?.[fieldname]?.public_id) {
			throw new NotFoundException('You do/not have a ' + fieldname, 'companyService.deleteCompanyPic');
		}

		await cloudinary.uploader
			.destroy(company?.[fieldname]?.public_id || `${fieldname}_${company._id}`, {
				resource_type: 'image',
				invalidate: true,
			})
			.catch((error) => {
				console.error('Error deleting image from Cloudinary:', error);
			});

		const updatedCompany = await this.CompanyRepo.findByIdAndUpdate(company._id, { $set: { [fieldname]: null } })
			.lean()
			.select(fieldname)
			.exec();

		if (!updatedCompany) {
			throw new NotFoundException('Company not found', 'companyService.deleteCompanyPic');
		}

		return updatedCompany;
	}
}

export default new CompanyServices();
