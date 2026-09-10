import z from 'zod';
import { appConfig } from '../../config/app.config';
import { sortOrderEnum } from '../../shared/enums/query.enum';
import {
	commaSeparatedArray,
	generalFields,
	parseCommaSeparatedArray,
} from '../../shared/validation/general-fields.validation';
import { JobLocationEnum, SeniorityLevelEnum, WorkingTimeEnum } from './job.enum';

const { defaultOrder, defaultLimit } = appConfig.job;

export const paramsJobSchema = {
	params: z.strictObject({
		jobId: generalFields.id,
	}),
};

export const getJobSchema = {
	params: z.strictObject({
		jobId: generalFields.id,
	}),
};

export const getCompanyJobsSchema = {
	params: z.strictObject({
		companyId: generalFields.id.optional(),
		jobId: generalFields.id.optional(),
	}),

	query: z.object({
		page: generalFields.page.default(1).optional(),
		limit: generalFields.limit.default(defaultLimit || 10).optional(),
		order: generalFields.order.default(defaultOrder || sortOrderEnum.ASC).optional(),
		search: generalFields.search.optional(),
	}),
};

const jobSchema = z.strictObject({
	jobTitle: z
		.string()
		.min(3, 'Job title must be at least 3 characters long')
		.max(100, 'Job title must be at most 100 characters long'),

	jobDescription: z
		.string()
		.min(3, 'Job title must be at least 3 characters long')
		.max(2000, 'Job title must be at most 2000 characters long'),

	jobLocation: z.enum(Object.values(JobLocationEnum)).default(JobLocationEnum.ONSITE),
	workingTime: z.enum(Object.values(WorkingTimeEnum)).default(WorkingTimeEnum.FULL_TIME),
	seniorityLevel: z.enum(Object.values(SeniorityLevelEnum)).default(SeniorityLevelEnum.JUNIOR),
	technicalSkills: z.array(
		z.string().min(2, 'Skill must be at least 2 character.').max(30, 'Skill must be at most 30 character.'),
	),
	softSkills: z.array(
		z.string().min(2, 'Skill must be at least 2 character.').max(30, 'Skill must be at most 30 character.'),
	),
});

export const createJobSchema = {
	body: jobSchema,

	params: z.strictObject({
		companyId: generalFields.id,
	}),
};
export type ICreateJobDTO = z.infer<typeof createJobSchema.body>;

export const updateJobSchema = {
	body: jobSchema.partial(),

	params: z.strictObject({
		jobId: generalFields.id,
		// companyId: generalFields.id,
	}),
};
export type IUpdateJobDTO = z.infer<typeof updateJobSchema.body>;

export const getJobsSchema = {
	query: z.object({
		// 1. Pagination & Sorting fields
		page: generalFields.page.default(1).optional(),
		limit: generalFields.limit.default(defaultLimit || 10).optional(),
		order: generalFields.order.default(defaultOrder || sortOrderEnum.ASC).optional(),

		// 2. Global Fuzzy Search (searches in title, description, skills)
		search: generalFields.search.optional(),
		// workingTime, jobLocation, seniorityLevel and jobTitle, technicalSkills, softSkills

		// 3. Specific Text Search Filters
		jobTitle: z.string().optional(),

		// 4. Multi-Select Enum Filters (Optional and parsed safely)
		jobLocation: z
			.preprocess(parseCommaSeparatedArray, z.array(z.enum(Object.values(JobLocationEnum)).optional()))
			.optional(),
		workingTime: z
			.preprocess(parseCommaSeparatedArray, z.array(z.enum(Object.values(WorkingTimeEnum)).optional()))
			.optional(),
		seniorityLevel: z
			.preprocess(parseCommaSeparatedArray, z.array(z.enum(Object.values(SeniorityLevelEnum)).optional()))
			.optional(),

		// 5. Skills Array Filters
		technicalSkills: commaSeparatedArray.optional(),
		softSkills: commaSeparatedArray.optional(),
	}),
};

export type IGetJobsQueryDTO = z.infer<typeof getJobsSchema.query>;
