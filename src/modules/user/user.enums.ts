export const GenderEnum = {
	MALE: 0,
	FEMALE: 1,
} as const;

export type TGender = (typeof GenderEnum)[keyof typeof GenderEnum];
export type TGendersKey = keyof typeof GenderEnum;

export const ProviderEnum = {
	SYSTEM: 'system',
	GOOGLE: 'google',
	FACEBOOK: 'facebook',
	TWITTER: 'twitter',
} as const;

export type TProvider = (typeof ProviderEnum)[keyof typeof ProviderEnum];

export const RoleEnum = {
	USER: 0,
	ADMIN: 1,
} as const;

export type TRole = (typeof RoleEnum)[keyof typeof RoleEnum];

export const otpTypeEnum = {
	CONFIRM_EMAIL: 'confirmEmail',
	FORGET_PASSWORD: 'forgetPassword',
} as const;

export type TOtpType = (typeof otpTypeEnum)[keyof typeof otpTypeEnum];
