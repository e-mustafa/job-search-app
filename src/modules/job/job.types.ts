import { HydratedDocument } from 'mongoose';
import { Id } from '../../shared/types';
import { IGeneralCompany } from '../company';
import { TJobLocation, TSeniorityLevel, TWorkingTime } from './job.enum';

export interface IJob {
	_id: Id;
	id: string;

	jobTitle: string;
	jobLocation: TJobLocation;
	workingTime: TWorkingTime;
	seniorityLevel: TSeniorityLevel;
	jobDescription: string;
	technicalSkills: string[];
	softSkills: string[];
	addedBy: Id;
	updatedBy?: Id;
	companyId: Id;
	closed: boolean;

	createdAt: Date;
	updatedAt?: Date;
}

export type IJobDocument = HydratedDocument<IJob>;
export type IJobWCompany = IJob & { companyId: IGeneralCompany };
