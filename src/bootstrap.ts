import chalk from 'chalk';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Express, NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { corsOptions } from './config/cors.config';
import { ENV } from './config/env.config';
import { limiter } from './config/rate-limit.config';
import { connectDB } from './DB/connection';
import { globalErrorHandler } from './middlewares/error.middleware';
import {
	adminRouter,
	adminRoutes,
	authRouter,
	authRoutes,
	chatRouter,
	chatRoutes,
	companyRouter,
	companyRoutes,
	jobRouter,
	jobRoutes,
	notificationRouter,
	notificationRoutes,
	userRouter,
	userRoutes,
} from './modules';
import { applicationRouter, applicationRoutes } from './modules/application';
import { NotFoundException } from './shared/response/exception.response';
import { connectRedis } from './utils/redis/client.redis';
import { initializeSocket } from './utils/socket/socket.init';

const apiBaseUrl = ENV.apiBaseUrl;

export const bootstrap = (app: Express): void => {
	app.set('trust proxy', 1);

	// Security middlewares
	app.use(helmet(), limiter, cors(corsOptions));

	// Body parsers
	app.use(express.json());
	app.use(cookieParser());

	// Ensure Database and Redis connections on incoming requests
	app.use(async (_req: Request, _res: Response, next: NextFunction): Promise<void> => {
		try {
			await connectDB();
			await connectRedis();
			next();
		} catch (error) {
			next(error);
		}
	});

	// Base root check route
	app.get('/', (_req: Request, res: Response): void => {
		res.status(200).json({ message: `Welcome TO ${ENV.appName} APP` });
	});

	// Register application routers
	app.use(`${apiBaseUrl}${authRoutes.base}`, authRouter);
	app.use(`${apiBaseUrl}${userRoutes.base}`, userRouter);
	app.use(`${apiBaseUrl}${companyRoutes.base}`, companyRouter);
	app.use(`${apiBaseUrl}${jobRoutes.base}`, jobRouter);
	app.use(`${apiBaseUrl}${applicationRoutes.base}`, applicationRouter);
	app.use(`${apiBaseUrl}${notificationRoutes.base}`, notificationRouter);
	app.use(`${apiBaseUrl}${chatRoutes.base}`, chatRouter);
	app.use(`${apiBaseUrl}${adminRoutes.base}`, adminRouter);

	// Handle non-existent routes
	app.use((_req: Request, _res: Response, _next: NextFunction): void => {
		throw new NotFoundException('❌ This route does not exist!', 'route_not_exist');
	});

	// Global error handling middleware
	app.use(globalErrorHandler);

	// Skip app.listen and Socket initialization in Vercel environment
	if (process.env.VERCEL !== '1') {
		const httpServer = app.listen(ENV.port, (): void =>
			console.log(chalk.bgGreenBright.bold('✔ App is running on port: ' + ENV.port)),
		);

		initializeSocket(httpServer);
	}
};
