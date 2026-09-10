import { Request, Response } from 'express';
import { successResponse } from '../../shared/response/success.response';
import { Id, IUserBody } from '../../shared/types';
import { IQueryDTO } from '../../shared/validation/general-fields.validation';
import services from './job.service';
import { ICreateJobDTO, IGetJobsQueryDTO, IUpdateJobDTO } from './job.validation';

export async function createJob(req: Request, res: Response) {
	const { user, body, params } = req || {};
	const data = await services.createJob(user?._id as Id, params.companyId as string, body as ICreateJobDTO);
	successResponse({ res, status: 201, message: 'Job created successfully', data });
}

export async function updateJob(req: Request, res: Response) {
	const { user, body, params } = req || {};
	const data = await services.updateJob(user?._id as Id, params.jobId as string, body as IUpdateJobDTO);
	successResponse({ res, message: 'Job updated successfully', data });
}

export async function deleteJob(req: Request, res: Response) {
	const { jobId } = req.params || {};
	await services.deleteJob(req.user?._id as Id, jobId as string);
	successResponse({ res, message: 'Job deleted successfully' });
}

export async function getJob(req: Request, res: Response) {
	const { user, params } = req || {};
	const data = await services.getJob(user?._id as Id, params.jobId as string);
	successResponse({ res, message: 'Comment updated successfully', data });
}

export async function getJobs(req: Request, res: Response) {
	const { data, metadata } = await services.getJobs(req.user?._id as Id, req.query as IGetJobsQueryDTO);
	successResponse({ res, metadata, data });
}

export async function getCompanyJobs(req: Request, res: Response) {
	const result = await services.getCompanyJobs(
		req.user as IUserBody,
		req.query as IQueryDTO,
		req.params.companyId as string,
		req.params.jobId as string,
	);

	if ('data' in result && 'metadata' in result) {
		successResponse({ res, data: result.data, metadata: result.metadata });
	} else {
		successResponse({ res, data: result.data });
	}
}
