import { HydratedDocument } from 'mongoose';
import { Id, IImage } from '../../shared/types';
import { TGender, TOtpType, TProvider, TRole } from './user.enums';

interface IOtp {
	code: string;
	expiresAt: number;
	otpType: TOtpType;
}

export interface IUser {
	_id: Id;
	id?: string;

	firstName: string;
	lastName: string;
	email: string;
	password?: string;
	gender: TGender;
	bio?: string;
	provider: TProvider;
	role: TRole;
	loggedOutAllAt?: Date;
	notificationEnabled?: boolean;

	// status?: TUserStatus;
	// statusReason?: TStatusReason;
	// statusChangedAt?: Date;

	deviceTokens?: string[];
	deletedAt?: Date;
	lastSeenAt?: Date;
	createdAt: Date;
	updatedAt?: Date;

	username?: string;
	avatar?: IImage | null;
	cover?: IImage | null;
	DOB?: Date;
	mobileNumber?: string;
	updatedBy?: Id;
	isConfirmed?: Date;

	otp?: IOtp;
	bannedAt?: Date;
	changeCredentialTime?: Date;
}

export type IUserDocument = HydratedDocument<IUser>;

export interface IGeneralUser extends Pick<
	IUser,
	'_id' | 'id' | 'firstName' | 'lastName' | 'username' | 'bio' | 'gender' | 'avatar' | 'cover' | 'email'
> {}

export interface ISessionInfo {
	ip: string | undefined;
	device: string | undefined;
	createdAt: Date | string;
}

export interface ISessionResponse extends ISessionInfo {
	active: boolean;
}
