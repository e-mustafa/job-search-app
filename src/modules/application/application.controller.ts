import { Request, Response } from 'express';
import { successResponse } from '../../shared/response/success.response';
import { Id, IFile, IUserBody } from '../../shared/types';
import { generateApplicationsExcelStream, setupExcelHeaders } from './application.export';
import services from './application.service';
import {
	IApplicationsQueryDTO,
	IExportCompanyApplicationsQueryDTO,
	IUpdateApplicationStatusDTO,
} from './application.validation';

export async function applyToJob(req: Request, res: Response) {
	const file: IFile = (req.file?.userCV || {}) as IFile;
	const data = await services.applyToJob(req.user as IUserBody, req.params.jobId as string, file);
	successResponse({ res, status: 201, message: 'You applied successfully', data });
}

export async function updateApplicationStatus(req: Request, res: Response) {
	const data = await services.updateApplicationStatus(
		req.user as IUserBody,
		req.params.applicationId as string,
		req.body as IUpdateApplicationStatusDTO,
	);
	successResponse({ res, message: 'Application status updated successfully', data });
}

export async function getJobApplications(req: Request, res: Response) {
	const { data, metadata } = await services.getJobApplications(
		req.user?._id as Id,
		req.params.jobId as string,
		req.query as unknown as IApplicationsQueryDTO,
	);
	successResponse({ res, metadata, data });
}

export async function exportCompanyApplications(req: Request, res: Response): Promise<void> {
	const data = await services.exportCompanyApplications(
		req.user?._id as Id,
		req.params.companyId as string,
		req.query as unknown as IExportCompanyApplicationsQueryDTO,
	);

	// return successResponse({ res, data });
	try {
		// Format safe filename with .xlsx extension
		const safeTimestamp = new Date().toISOString().replace(/:/g, '-');
		const fileName = `applications-${safeTimestamp}.xlsx`;

		setupExcelHeaders(res, fileName);
		await generateApplicationsExcelStream(res, data);
	} catch (error) {
		console.error('Export Error:', error);
		if (!res.headersSent) {
			res.status(500).json({ message: 'Failed to export applications' });
		}
	}
}

// export async function getMyApplications(req: Request, res: Response) {
// 	const { data, metadata } = await services.getMyApplications(req.user?._id as Id, req.query as unknown as IQueryDTO);
// 	successResponse({ res, metadata, data });
// }

// export async function getApplications(req: Request, res: Response) {
// 	const { data, metadata } = await services.getApplications(req.user?._id as Id, req.query as unknown as IQueryDTO);
// 	successResponse({ res, metadata, data });
// }

// export async function getApplication(req: Request, res: Response) {
// 	const data = await services.getApplication(req.user?._id as Id, req.params.applicationId as string, req.query as unknown as IQueryDTO);
// 	successResponse({ res, data });
// }

// export async function deleteApplication(req: Request, res: Response) {
// 	const data = await services.deleteApplication(req.user?._id as Id, req.params.applicationId as string, req.query as unknown as IQueryDTO);
// 	successResponse({ res, message: 'Application deleted successfully', data });
// }
