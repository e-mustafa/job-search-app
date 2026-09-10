import { Request, Response } from 'express';
import { successResponse } from '../../shared/response/success.response';
import { Id, IFile, IUserBody } from '../../shared/types';
import { IQueryDTO } from '../../shared/validation/general-fields.validation';
import services from './company.service';
import { ICreateCompanyDTO, IUpdateCompanyDTO } from './company.validation';

export async function getCompanies(req: Request, res: Response) {
	const { data, metadata } = await services.getCompanies(req.user as IUserBody, req.query as unknown as IQueryDTO);
	successResponse({ res, metadata, data });
}

export async function getCompany(req: Request, res: Response) {
	const data = await services.getCompany(req.user?._id as Id, req.params.companyId as string);
	successResponse({ res, data });
}

export async function createCompany(req: Request, res: Response) {
	const { user, body = {} } = req || {};
	const file: IFile = (req.file?.legalAttachment || {}) as IFile;
	const data = await services.createCompany(user?._id as Id, body as ICreateCompanyDTO, file as IFile);
	successResponse({ res, status: 201, message: 'Company created successfully', data });
}

export async function updateCompany(req: Request, res: Response) {
	const { user, params, body = {} } = req || {};
	const data = await services.updateCompany(user?._id as Id, params.companyId as string, body as IUpdateCompanyDTO);
	successResponse({ res, message: 'Company updated successfully', data });
}

export async function deleteCompany(req: Request, res: Response) {
	await services.deleteCompany(req.user as IUserBody, req.params.companyId as string);
	successResponse({ res, message: 'Company deleted successfully' });
}

export async function uploadCompanyPic(req: Request, res: Response) {
	const fieldName = Object.keys(req.file || {})[0] || 'logo';
	const file: IFile = (req.file?.[fieldName] || {}) as IFile;
	const data = await services.uploadCompanyPic(req.user?._id as Id, req.params.companyId as string, file);
	successResponse({ res, message: `${file.fieldname} uploaded successfully`, data });
}

export function deleteCompanyPic(fieldname: 'logo' | 'coverPic') {
	return async (req: Request, res: Response) => {
		const data = await services.deleteCompanyPic(req.user?._id as Id, req.params.companyId as string, fieldname);
		successResponse({ res, message: `${fieldname} deleted successfully`, data });
	};
}
