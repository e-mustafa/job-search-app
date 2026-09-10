import chalk from 'chalk';
import mongoose from 'mongoose';
import { ENV } from '../config/env.config';
import { initOtpCleanupCron } from '../utils/cron/otpCleanup.cron';

export const connectDB = async () => {
	try {
		const cnn = await mongoose.connect(ENV.db.dbUrl, { serverSelectionTimeoutMS: 5000 });
		console.log(chalk.green(`✔ Database connected successfully on: ${cnn.connection.name}`));

		// Start OTP cleanup cron
		initOtpCleanupCron();
	} catch (error) {
		console.error(chalk.red('❌ Database connection error:'), error);
		throw error;
		// process.exit(1);
	}
};
