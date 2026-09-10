import z from 'zod';
import { appConfig } from '../../config/app.config';
import { sortOrderEnum } from '../../shared/enums/query.enum';
import { IFile } from '../../shared/types';
import { arrayIdsSchema, generalFields, parseFormDataArray } from '../../shared/validation/general-fields.validation';

const { defaultOrder, defaultLimit } = appConfig.company;

export const companyIdParamsSchema = {
	params: z.strictObject({
		companyId: generalFields.id,
	}),
};

const companySchema = z.strictObject({
	companyName: z
		.string()
		.min(3, 'Company name must be at least 3 characters.')
		.max(100, 'Company name must be at most 100 characters.'),
	companyEmail: generalFields.email,
	description: z
		.string()
		.min(3, 'Description must be at least 3 characters.')
		.max(2000, 'Description must be at most 2000 characters.'),
	industry: generalFields.firstName,
	address: z
		.string()
		.min(3, 'Company name must be at least 3 characters.')
		.max(100, 'Company name must be at most 100 characters.'),
	numberOfEmployees: z
		.string()
		.min(3, 'Company name must be at least 3 characters.')
		.max(100, 'Company name must be at most 100 characters.'),
	website: z
		.url()
		.min(3, 'Company name must be at least 3 characters.')
		.max(100, 'Company name must be at most 100 characters.')
		.optional(),
	HRs: parseFormDataArray(arrayIdsSchema).optional(),
});

export const createCompanySchema = {
	body: companySchema,
	file: z.object({
		legalAttachment: generalFields.file,
	}),
};
export type ICreateCompanyDTO = z.infer<typeof createCompanySchema.body> & { attachments?: IFile[] };

export const updateCompanySchema = {
	body: companySchema.partial(),
	params: companyIdParamsSchema.params,
};
export type IUpdateCompanyDTO = z.infer<typeof updateCompanySchema.body>;

export const getCompaniesSchema = {
	query: z.object({
		page: generalFields.page.default(1).optional(),
		limit: generalFields.limit.default(defaultLimit || 10).optional(),
		order: generalFields.order.default(defaultOrder || sortOrderEnum.ASC).optional(),
		search: generalFields.search.optional(),
	}),
};

export type IGetCompaniesQueryDTO = z.infer<typeof getCompaniesSchema.query>;

export const uploadCompanyLogoSchema = {
	params: z.strictObject({
		companyId: generalFields.id,
	}),
	file: z.object({
		logo: generalFields.file,
	}),
};

export const uploadCompanyCoverSchema = {
	params: z.strictObject({
		companyId: generalFields.id,
	}),
	file: z.object({
		coverPic: generalFields.file,
	}),
};
