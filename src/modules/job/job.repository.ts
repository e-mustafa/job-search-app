import { BaseRepository } from '../../DB/base.repository';
import Job from './job.model';
import { IJob } from './job.types';

export class JobRepository extends BaseRepository<IJob> {
	constructor() {
		super(Job);
	}
}

export default new JobRepository();
