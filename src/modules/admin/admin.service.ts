import { QueryFilter } from 'mongoose';
import { sortOrderEnum } from '../../shared/enums/query.enum';
import { ConflictException, NotFoundException, UnAuthorizedException } from '../../shared/response/exception.response';
import { IUserBody } from '../../shared/types';
import { IQueryDTO } from '../../shared/validation/general-fields.validation';
import { companyRepository, ICompany, ICompanyWUsers } from '../company';
import { RoleEnum } from '../user/user.enums';
import userRepository from '../user/user.repository';

class AdminServices {
	constructor(
		private readonly UserRepo = userRepository,
		private readonly CompanyRepo = companyRepository,
	) {}

	async getUsers(user: IUserBody, { page = 1, limit = 10, order = sortOrderEnum.DESC, search = '' }: IQueryDTO) {
		if (user.role !== RoleEnum.ADMIN) {
			throw new UnAuthorizedException('You are not authorized', 'UserGraphqlService.getUsers');
		}

		const filter: QueryFilter<IUserBody> = { _id: { $ne: user?._id } };

		if (search?.trim()) {
			const searchRegex = { $regex: search.trim(), $options: 'i' };
			filter.$or = [{ firstName: searchRegex }, { lastName: searchRegex }, { email: searchRegex }];
		}

		const users = await this.UserRepo.find(filter, { ignoreDefaultFilters: true })
			.lean()
			.select('-password -otp')
			.sort({ createdAt: order === sortOrderEnum.ASC ? 1 : -1 })
			.paginate(page, limit)
			.exec();

		console.log('users', users);

		return users;
	}

	async toggleBanUser(user: IUserBody, targetUserId: string) {
		if (user.role !== RoleEnum.ADMIN) {
			throw new UnAuthorizedException('You are not authorized', 'AdminServices.toggleBanUser');
		}

		if (String(user._id) === String(targetUserId)) {
			throw new ConflictException('You cannot ban yourself', 'AdminServices.toggleBanUser');
		}

		const userExists = await this.UserRepo.findById(targetUserId, { ignoreDefaultFilters: true }).lean().exec();
		if (!userExists) throw new NotFoundException('User not found', 'AdminServices.toggleBanUser');
		if (userExists.deletedAt) throw new ConflictException('User already deleted', 'AdminServices.toggleBanUser');

		const isBanned = Boolean(userExists?.bannedAt);

		const update = isBanned ? { $unset: { bannedAt: 1 } } : { $set: { bannedAt: new Date() } };

		const userData = await this.UserRepo.findOneAndUpdate({ _id: targetUserId }, update, { ignoreDefaultFilters: true })
			.lean()
			.select('-password -otp')
			.exec();
		return userData;
	}

	async getCompanies(user: IUserBody, { page = 1, limit = 10, order = sortOrderEnum.DESC, search = '' }: IQueryDTO) {
		if (user.role !== RoleEnum.ADMIN) {
			throw new UnAuthorizedException('You are not authorized', 'AdminServices.getUsers');
		}

		const filter: QueryFilter<ICompany> = {};

		if (search?.trim()) {
			filter.companyName = { $regex: search.trim(), $options: 'i' };
			filter.companyEmail = { $regex: search.trim(), $options: 'i' };
		}

		const companies = await this.CompanyRepo.find(filter, { ignoreDefaultFilters: true })
			.lean()
			.sort({ createdAt: order === sortOrderEnum.ASC ? 1 : -1 })
			.paginate(page, limit)
			.populate<ICompanyWUsers>([{ path: 'createdBy' }, { path: 'HRs' }])
			.exec();

		return companies;
	}

	async approveCompany(user: IUserBody, companyId: string) {
		if (user.role !== RoleEnum.ADMIN) {
			throw new UnAuthorizedException('You are not authorized', 'AdminServices.approveCompany');
		}
		const company = await this.CompanyRepo.findById(companyId, { ignoreDefaultFilters: true }).lean().exec();

		if (!company || company?.deletedAt) throw new NotFoundException('Company not found', 'AdminServices.approveCompany');
		if (company?.bannedAt) throw new ConflictException('Company already banned', 'AdminServices.approveCompany');
		if (company.approvedByAdmin) throw new ConflictException('Company already approved', 'AdminServices.approveCompany');

		return await this.CompanyRepo.findByIdAndUpdate(companyId, { approvedByAdmin: true }, { ignoreDefaultFilters: true })
			.lean()
			.exec();
	}

	async toggleBanCompany(user: IUserBody, companyId: string) {
		if (user.role !== RoleEnum.ADMIN) {
			throw new UnAuthorizedException('You are not authorized', 'AdminServices.toggleBanCompany');
		}
		const company = await this.CompanyRepo.findById(companyId, { ignoreDefaultFilters: true }).lean().exec();

		if (!company || company?.deletedAt) throw new NotFoundException('Company not found', 'AdminServices.toggleBanCompany');

		const isBanned = Boolean(company?.bannedAt);

		const update = isBanned ? { $unset: { bannedAt: 1 } } : { $set: { bannedAt: new Date() } };

		const updatedCompany = await this.CompanyRepo.findByIdAndUpdate(companyId, update, { ignoreDefaultFilters: true })
			.lean()
			.exec();

		return updatedCompany;
	}

	async deleteCompany(user: IUserBody, companyId: string) {
		if (user.role !== RoleEnum.ADMIN) {
			throw new UnAuthorizedException('You are not authorized', 'AdminServices.deleteCompany');
		}
		const company = await this.CompanyRepo.findById(companyId, { ignoreDefaultFilters: true }).lean().exec();
		if (!company) throw new NotFoundException('Company not found', 'AdminServices.deleteCompany');
		if (company?.deletedAt) throw new ConflictException('Company already deleted', 'AdminServices.deleteCompany');

		return await this.CompanyRepo.findByIdAndUpdate(companyId, { deletedAt: new Date() }, { ignoreDefaultFilters: true })
			.lean()
			.exec();
	}
}

export default new AdminServices();
