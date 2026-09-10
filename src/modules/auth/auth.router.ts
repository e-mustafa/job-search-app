import { Router } from 'express';
import { auth } from '../../middlewares/auth.middleware';
import { validation } from '../../middlewares/validation.middleware';
import * as C from './auth.controller';
import * as V from './auth.validation';

const router = Router();

export const routes = {
	base: '/auth',
	checkUsername: '/check-username',
	register: '/register',
	resendOtp: '/verify-account/resend-otp',

	login: '/login',
	refreshToken: '/refresh-token',

	verifyAccount: '/verify-account',

	socialLogin_google: '/social-login/google',

	changePassword: '/change-password',

	forgotPassword: '/forgot-password',
	resetPassword: '/reset-password',

	// requestChangeEmail: '/request-change-email',
	// changeEmail: '/change-email',
	// revertEmail: '/revert-email',

	logout: '/logout',
	logoutAll: '/logout-all',

	// get sessions
	getSessions: '/sessions',
	getSession: '/session',

	removeSessions: '/sessions/:sessionId',

	deactivateMyAccount: '/deactivate',
	activateMyAccount: '/reactivate',
};

// router.post(routes.checkUsername, validation(V.checkUsernameSchema), C.checkUsername);

router.post(routes.register, validation(V.registerSchema), C.register);
router.post(routes.resendOtp, validation(V.resendOtpSchema), C.resendOtp);
router.patch(routes.verifyAccount, validation(V.verifyAccountSchema), C.verifyAccount);

router.post(routes.login, validation(V.loginSchema), C.login);
router.patch(routes.refreshToken, validation(V.refreshAccessTokenSchema), C.refreshAccessToken);

router.post(routes.socialLogin_google, validation(V.socialGoogleSchema), C.socialLogin_google);

router.post(routes.forgotPassword, validation(V.forgetPasswordSchema), C.forgetPassword);
router.patch(routes.resetPassword, validation(V.resetPasswordSchema), C.resetPassword);

router.post(routes.logout, C.logout);
router.post(routes.logoutAll, C.logoutAll);

// sessions
router.get(routes.getSession, auth(), C.getThisSession);
router.get(routes.getSessions, auth(), C.getMySessions);
router.delete(routes.removeSessions, auth(), C.removeSession);

// change password
router.patch(routes.changePassword, auth(), validation(V.changePasswordSchema), C.changePassword);

// active/inactive Account -------------------------------------------------
// router.patch(routes.deactivateMyAccount, auth(), validation(refreshAccessTokenSchema), deactivateMyAccount);
// router.patch(routes.activateMyAccount, validation(reactivateAccountSchema), reactivateMyAccount);

export default router;
