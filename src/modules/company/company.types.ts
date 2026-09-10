import { HydratedDocument } from 'mongoose';
import { Id, IImage, TAttachment } from '../../shared/types';
import { IJob } from '../job';
import { IGeneralUser } from '../user';

export interface ICompany {
	_id: Id;
	id?: string;
	companyName: string;
	companyEmail: string;
	description?: string;
	industry?: string;
	address?: string;
	numberOfEmployees?: string;
	website?: string;
	logo?: IImage | null;
	coverPic?: IImage | null;
	createdBy: Id;
	legalAttachment?: TAttachment;
	deletedAt?: Date;
	approvedByAdmin: boolean;
	HRs: Id[];

	bannedAt?: Date;

	createdAt: Date;
	updatedAt?: Date;
}

export type ICompanyDocument = HydratedDocument<ICompany>;
export type ICompanyWCreator = ICompany & { createdBy: IGeneralUser };
export type ICompanyWJobs = ICompany & { jobs: IJob[] };
export type ICompanyWHrs = ICompany & { HRs: IGeneralUser[] };
export type ICompanyWUsers = ICompany & { createdBy: IGeneralUser; HRs: IGeneralUser[] };
export type IGeneralCompany = Pick<ICompany, 'companyName' | 'companyEmail' | 'logo' | 'coverPic'>;
