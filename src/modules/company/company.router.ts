import { Router } from 'express';
import { appConfig } from '../../config/app.config';
import { auth } from '../../middlewares/auth.middleware';
import { validation } from '../../middlewares/validation.middleware';
import { fileTypes } from '../../utils/upload-files/mime-types';
import { uploadCloud } from '../../utils/upload-files/multer';
import * as controller from './company.controller';
import {
	companyIdParamsSchema,
	createCompanySchema,
	getCompaniesSchema,
	updateCompanySchema,
	uploadCompanyCoverSchema,
	uploadCompanyLogoSchema,
} from './company.validation';

const router = Router();

export const routes = {
	base: '/companies',

	getCompanies: '/',
	getCompany: '/:companyId',
	getCompanyByName: '/name/:companyName', // TODO: implement

	createCompany: '/',
	updateCompany: '/:companyId',
	deleteCompany: '/:companyId',

	uploadCompanyLogo: '/:companyId/logo',
	deleteCompanyLogo: '/:companyId/logo',

	uploadCompanyCover: '/:companyId/cover',
	deleteCompanyCover: '/:companyId/cover',
};

// apply auth middleware for all routes in this router
router.use(auth());

const attachmentsConfig = appConfig.company.attachments;

router.get(routes.getCompanies, validation(getCompaniesSchema), controller.getCompanies);
router.post(
	routes.createCompany,
	uploadCloud([fileTypes.images, fileTypes.docs], attachmentsConfig.maxSize).single('legalAttachment'),
	validation(createCompanySchema),
	controller.createCompany,
);

// /:companyId
router.get(routes.getCompany, validation(companyIdParamsSchema), controller.getCompany);
router.patch(routes.updateCompany, validation(updateCompanySchema), controller.updateCompany);
router.delete(routes.deleteCompany, validation(companyIdParamsSchema), controller.deleteCompany);

// images routes
router.patch(
	routes.uploadCompanyLogo,
	uploadCloud([fileTypes.images], attachmentsConfig.maxSize).single('logo'),
	validation(uploadCompanyLogoSchema),
	controller.uploadCompanyPic,
);

router.patch(
	routes.uploadCompanyCover,
	uploadCloud(fileTypes.images, attachmentsConfig.maxSize).single('coverPic'),
	validation(uploadCompanyCoverSchema),
	controller.uploadCompanyPic,
);

router.delete(routes.deleteCompanyLogo, validation(companyIdParamsSchema), controller.deleteCompanyPic('logo'));
router.delete(routes.deleteCompanyCover, validation(companyIdParamsSchema), controller.deleteCompanyPic('coverPic'));

export default router;
