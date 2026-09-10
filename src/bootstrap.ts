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

export const bootstrap = async (app: Express): Promise<void> => {
	app.set('trust proxy', 1);
	// security middlewares
	app.use(helmet(), limiter, cors(corsOptions));

	// body parsers
	app.use(express.json());
	app.use(cookieParser()); // for parsing cookies

	// database connection
	await connectDB();
	await connectRedis();

	app.get('/', (_req: Request, res: Response) => {
		res.status(200).json({ message: `Welcome TO ${ENV.appName} APP` });
	});

	// routes --------------------------------------------------------
	app.use(`${apiBaseUrl}${authRoutes.base}`, authRouter);
	app.use(`${apiBaseUrl}${userRoutes.base}`, userRouter);
	app.use(`${apiBaseUrl}${companyRoutes.base}`, companyRouter);
	app.use(`${apiBaseUrl}${jobRoutes.base}`, jobRouter);
	app.use(`${apiBaseUrl}${applicationRoutes.base}`, applicationRouter);
	app.use(`${apiBaseUrl}${notificationRoutes.base}`, notificationRouter);
	app.use(`${apiBaseUrl}${chatRoutes.base}`, chatRouter);
	app.use(`${apiBaseUrl}${adminRoutes.base}`, adminRouter);
	// routes --------------------------------------------------------

	// handle not found routes
	app.use((_req: Request, _res: Response, _next: NextFunction) => {
		throw new NotFoundException('❌ This route not exist!', 'route_not_exist');
	});

	// error handler
	app.use(globalErrorHandler);

	const httpServer = app.listen(ENV.port, () =>
		console.log(chalk.bgGreenBright.bold('✔ App is running on port: ' + ENV.port)),
	);

	// initialize socket
	initializeSocket(httpServer);
};
