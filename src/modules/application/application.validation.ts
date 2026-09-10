import z from 'zod';
import { appConfig } from '../../config/app.config';
import { generalFields } from '../../shared/validation/general-fields.validation';
import { ApplicationStatusEnum } from './application.enum';
import { sortOrderEnum } from '../../shared/enums/query.enum';

const { defaultOrder, defaultLimit } = appConfig.application;

export const addApplicationSchema = {
	params: z.strictObject({
		jobId: generalFields.id,
	}),
	// body: z.strictObject({
	// 	// jobId: generalFields.id,
	// 	userCV: generalFields.file,
	// }),

	file: z.object({
		userCV: generalFields.file,
	}),
};

// export type IAddApplicationSchemaDTO = z.infer<typeof addApplicationSchema.body>;

export const updateApplicationStatusSchema = {
	params: z.strictObject({
		applicationId: generalFields.id,
	}),
	body: z.strictObject({
		status: z.enum(
			ApplicationStatusEnum,
			'Application status must be one of the following: ' + Object.values(ApplicationStatusEnum).join(', '),
		),
	}),
};

export type IUpdateApplicationStatusDTO = z.infer<typeof updateApplicationStatusSchema.body>;

export const getJobApplicationsSchema = {
	params: z.strictObject({
		jobId: generalFields.id,
	}),
	query: z.strictObject({
		page: z.number().optional().default(1),
		limit: z.number().optional().default(defaultLimit),
		order: z.string().optional().default(defaultOrder),
	}),
};

export type IApplicationsQueryDTO = z.infer<typeof getJobApplicationsSchema.query>;

export const exportCompanyApplicationsSchema = {
	params: z.strictObject({
		companyId: generalFields.id,
	}),
	query: z.strictObject({
		// day: z.date('invalid date format, use YYYY-MM-DD').optional(),
		day: z.string().date('Invalid date format, use YYYY-MM-DD').optional(),
		order: z.enum(Object.values(sortOrderEnum)).optional().default(defaultOrder),
	}),
};

export type IExportCompanyApplicationsQueryDTO = z.infer<typeof exportCompanyApplicationsSchema.query>;
