// import cron from 'node-cron';
import { schedule, ScheduledTask } from 'node-cron';
import User from '../../modules/user/user.model';

/**
 * Clean up expired OTPs embedded inside user documents
 */
export const cleanupExpiredOtps = async (): Promise<void> => {
	try {
		const now = new Date();

		const result = await User.updateMany(
			{
				otp: {
					$elemMatch: {
						expiresAt: { $lt: now },
					},
				},
			},
			{
				$pull: {
					otp: {
						expiresAt: { $lt: now },
					},
				},
			},
		);

		console.log(
			`[CRON] Expired OTP array cleanup executed. Matched users: ${result.matchedCount}, Modified users: ${result.modifiedCount}`,
		);
	} catch (error) {
		console.error('[CRON] Failed to clean up expired OTPs:', error);
	}
};

/**
 * Initializes cron scheduler
 */
export const initOtpCleanupCron = (): ScheduledTask => {
	// Cron expression: 0 */6 * * * (Every 6 hours)
	return schedule('0 */6 * * *', async () => {
		await cleanupExpiredOtps();
	});
};
