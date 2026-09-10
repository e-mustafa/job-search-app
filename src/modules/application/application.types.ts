import { HydratedDocument } from 'mongoose';
import { Id, IImage } from '../../shared/types';
import { IJob } from '../job';
import { IGeneralUser } from '../user';
import { TApplicationStatus } from './application.enum';

export interface IApplication {
	_id: Id;
	id: string;
	userId: Id;
	jobId: Id;
	companyId: Id;
	status: TApplicationStatus;
	userCV: IImage | null;

	createdAt: Date;
	updatedAt: Date;
}

export type IApplicationDocument = HydratedDocument<IApplication>;
export type IApplicationWUser = IApplication & { userId: IGeneralUser };
export type IApplicationWData = IApplication & { userId: IGeneralUser; jobId: Partial<IJob> };
