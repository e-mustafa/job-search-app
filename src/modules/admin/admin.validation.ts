import z from 'zod';
import { generalFields } from '../../shared/validation/general-fields.validation';

export const paramsUserIdSchema = {
	params: z.strictObject({
		userId: generalFields.id,
	}),
};

export const paramsCompanyIdSchema = {
	params: z.strictObject({
		companyId: generalFields.id,
	}),
};
