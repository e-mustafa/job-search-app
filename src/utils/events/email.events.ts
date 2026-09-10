import { appConfig } from '../../config/app.config';
import { applicationAcceptedEmail } from '../emails/application-accepted.email';
import { applicationRejectedEmail } from '../emails/application-rejected.email';
import { sendResetPasswordEmail } from '../emails/reset-password.email';
import { verifyAccountEmail } from '../emails/verify-account.email';
import { TypedSafeEventEmitter } from './safe-event';

// 1. Central Event Payloads Map (Strict Type Safety)
export interface IEmailEventsMap {
	'verify-account': { email: string; name: string; otp: string | number };
	'reset-password': { email: string; name: string; resetLink: string; expiresIn?: number };
	'application-accepted': { email: string; name: string; jobTitle: string };
	'application-rejected': { email: string; name: string; jobTitle: string };
}

// 2. Instantiate with Event Map
const emailEvents = new TypedSafeEventEmitter<IEmailEventsMap>();

emailEvents.onAsync('verify-account', async ({ email, name, otp }) => {
	await verifyAccountEmail(email, name, otp);
});

emailEvents.onAsync(
	'reset-password',
	async ({ email, name, resetLink, expiresIn = appConfig.otp.resetPassword.expiresIn }) => {
		await sendResetPasswordEmail(email, name, resetLink, expiresIn);
	},
);

emailEvents.onAsync('application-accepted', async ({ email, name, jobTitle }) => {
	await applicationAcceptedEmail({ email, name, jobTitle });
});

emailEvents.onAsync('application-rejected', async ({ email, name, jobTitle }) => {
	await applicationRejectedEmail({ email, name, jobTitle });
});

export default emailEvents;
