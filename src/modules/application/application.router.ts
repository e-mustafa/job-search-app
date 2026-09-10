import { Router } from 'express';
import { authUser } from '../../middlewares/auth.middleware';
import { validation } from '../../middlewares/validation.middleware';
import { fileTypes } from '../../utils/upload-files/mime-types';
import { uploadCloud } from '../../utils/upload-files/multer';
import * as controllers from './application.controller';
import * as v from './application.validation';

const router = Router();

export const routes = {
	base: '',
	applyToJob: '/jobs/:jobId/apply',
	updateApplicationStatus: '/applications/:applicationId/status',

	getJobApplications: '/jobs/:jobId/applications',

	exportCompanyApplications: '/companies/:companyId/applications/export',

	// getMyApplications: 'applications',
	// getMyApplication: 'applications/:applicationId',
};

// router.use(auth());

router.post(
	routes.applyToJob,
	authUser(),
	uploadCloud(fileTypes.docs).single('userCV'),
	validation(v.addApplicationSchema),
	controllers.applyToJob,
);

router.patch(
	routes.updateApplicationStatus,
	validation(v.updateApplicationStatusSchema),
	controllers.updateApplicationStatus,
);

router.get(routes.getJobApplications, validation(v.getJobApplicationsSchema), controllers.getJobApplications);

router.get(
	routes.exportCompanyApplications,
	validation(v.exportCompanyApplicationsSchema),
	controllers.exportCompanyApplications,
);

// router.get(routes.getMyApplications, controllers.getMyApplications);
// router.get(routes.getMyApplication, controllers.getMyApplication);

export default router;
