import { GenericRepository } from '../../DB/base.repository';
import Application from './application.model';
import { IApplication } from './application.types';

const applicationRepository: GenericRepository<IApplication> = new GenericRepository(Application);

export default applicationRepository;
