import { Router } from 'express';
import { auth } from '../../middlewares/auth.middleware';
import { validation } from '../../middlewares/validation.middleware';
import * as controller from './job.controller';
import * as v from './job.validation';

const router = Router({ mergeParams: true });

export const routes = {
	base: '',

	getJobs: '/jobs',
	getJob: '/jobs/:jobId',
	updateJob: '/jobs/:jobId',
	deleteJob: '/jobs/:jobId',

	createJob: '/companies/:companyId/jobs',
	getCompanyJobs: '/companies/:companyId/jobs/{:jobId}',
};

// Apply authentication middleware for all routes
router.use(auth());

// Browse jobs
router.get(routes.getJobs, validation(v.getJobsSchema), controller.getJobs);

// Company job routes - /:companyId
router.post(routes.createJob, validation(v.createJobSchema), controller.createJob);
router.get(routes.getCompanyJobs, validation(v.getCompanyJobsSchema), controller.getCompanyJobs);

// Job modifications - :jobId
router.get(routes.getJob, validation(v.getJobSchema), controller.getJob);
router.patch(routes.updateJob, validation(v.updateJobSchema), controller.updateJob);
router.delete(routes.deleteJob, validation(v.paramsJobSchema), controller.deleteJob);

export default router;
