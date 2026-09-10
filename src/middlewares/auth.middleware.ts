import { NextFunction, Request, Response } from 'express';
import { RoleEnum, TRole } from '../modules/user/user.enums';
import userRepository from '../modules/user/user.repository';
import { UnAuthorizedException } from '../shared/response/exception.response';
import { IUserBody } from '../shared/types';
import { decodeToken } from '../utils/security/token/token';
import { IJwtPayload } from '../utils/security/token/token.types';

// Instantiate repository once outside request context
const UserRepo = userRepository;

export const auth = (isOptional = false) => {
	return async (req: Request, _res: Response, next: NextFunction) => {
		const authorization = req.headers.authorization;

		if (!authorization) {
			if (isOptional) return next();

			// BadRequestException('Authorization header is required', 'Auth-middleware-no-auth-header');
			throw new UnAuthorizedException('Authorization header is required', 'Auth-middleware-no-auth-header');
		}
		const decoded: IJwtPayload | null = decodeToken(authorization) || null;

		if (!decoded) {
			if (isOptional) return next();
			throw new UnAuthorizedException('Invalid or expired token payload', 'Auth-middleware-invalid-token');
		}
		req.decoded = decoded;

		const user: IUserBody | null = await UserRepo.findById(decoded.id, { ignoreDefaultFilters: true })
			.lean()
			.select('-password')
			.exec();
		if (!user) {
			if (isOptional) return next();
			throw new UnAuthorizedException('User account not found or inactive', 'Auth-middleware-user-not-found');
		}

		if (user.bannedAt) {
			throw new UnAuthorizedException('User account is banned', 'Auth-middleware-user-banned');
		}

		if (user.deletedAt) {
			throw new UnAuthorizedException('User account is deleted', 'Auth-middleware-user-deleted');
		}

		if (user && !user.isConfirmed) {
			throw new UnAuthorizedException(
				'User account not verified, Please verify your account first.',
				'Auth-middleware-user-not-verified',
			);
		}

		req.user = user;
		return next();
	};
};

export const authorization = (...allowedRoles: TRole[]) => {
	return async (req: Request, _res: Response, next: NextFunction) => {
		if (!allowedRoles.includes(req.user?.role || 0)) {
			throw new UnAuthorizedException('Unauthorized Access!!', 'Auth-middleware-unauthorized');
		}
		return next();
	};
};

// All users authentication
export const authOptional = () => {
	return auth(true);
};

// All admins authorization
export const authAdmin = () => {
	return authorization(RoleEnum.ADMIN);
};

// User authorization
export const authUser = () => {
	return authorization(RoleEnum.USER);
};
