import { Request, Response } from 'express';
import { successResponse } from '../../shared/response/success.response';
import { IUserBody } from '../../shared/types';
import services from './admin.service';

export const toggleBanUser = async (req: Request, res: Response) => {
	const data = await services.toggleBanUser(req.user as IUserBody, req.params.userId as string);
	successResponse({ res, message: `User ${data?.bannedAt ? 'banned' : 'unbanned'} successfully`, data });
};

export const toggleBanCompany = async (req: Request, res: Response) => {
	const data = await services.toggleBanCompany(req.user as IUserBody, req.params.companyId as string);
	successResponse({ res, message: `Company ${data?.bannedAt ? 'banned' : 'unbanned'} successfully`, data });
};

export const approveCompany = async (req: Request, res: Response) => {
	await services.approveCompany(req.user as IUserBody, req.params.companyId as string);
	successResponse({ res, message: 'Company approved successfully' });
};
