import { cert, getApp, getApps, initializeApp, ServiceAccount } from 'firebase-admin/app';
import { getMessaging, Messaging } from 'firebase-admin/messaging';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ENVFirebaseAccountFile } from '../../config/env.config';

/**
 * Resolves Firebase ServiceAccount credentials across multiple environments.
 * Order of precedence:
 * 1. Stringified JSON in `FIREBASE_SERVICE_ACCOUNT` environment variable.
 * 2. Local JSON file defined by `ENVFirebaseAccountFile` (Local Dev).
 * 3. Individual environment variables (FIREBASE_PROJECT_ID, etc.).
 */
const getServiceAccount = (): ServiceAccount => {
	// 1. Try parsing JSON string from environment variable
	const envJson = process.env.FIREBASE_SERVICE_ACCOUNT;
	if (envJson) {
		try {
			const parsed = JSON.parse(envJson) as ServiceAccount;
			if (typeof parsed.privateKey === 'string') {
				parsed.privateKey = parsed.privateKey.replace(/\\n/g, '\n');
			}
			return parsed;
		} catch (error) {
			console.error('[Firebase] Failed to parse FIREBASE_SERVICE_ACCOUNT env var:', error);
		}
	}

	// 2. Try reading local file for local development
	try {
		const keyPath = resolve(ENVFirebaseAccountFile || '');
		if (keyPath && existsSync(keyPath)) {
			const fileContent = readFileSync(keyPath, 'utf8');
			return JSON.parse(fileContent) as ServiceAccount;
		}
	} catch (error) {
		console.error('[Firebase] Local key file reading failed:', error);
	}

	// 3. Fallback to individual variables
	const projectId = process.env.FIREBASE_PROJECT_ID;
	const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
	const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

	if (projectId && clientEmail && rawPrivateKey) {
		return {
			projectId,
			clientEmail,
			privateKey: rawPrivateKey.replace(/\\n/g, '\n'),
		};
	}

	throw new Error('[Firebase] Service account credentials could not be initialized.');
};

/**
 * Factory function ensuring single App instance per Serverless lambda lifecycle.
 */
const initializeFirebaseMessaging = (): Messaging => {
	const activeApps = getApps();

	const app = activeApps.length > 0 ? getApp() : initializeApp({ credential: cert(getServiceAccount()) });

	return getMessaging(app);
};

const messagingService = initializeFirebaseMessaging();

export default messagingService;
