import ExcelJS from 'exceljs';
import { Response } from 'express';
import { Cursor } from 'mongoose';
import { IApplicationWData } from './application.types';

/**
 * Sanitizes input strings to prevent Excel/CSV Formula Injection attacks.
 */
export function sanitizeExcelCell(value: string): string {
	const dangerousPrefixes = ['=', '+', '-', '@'];
	if (value && dangerousPrefixes.some((prefix) => value.startsWith(prefix))) {
		return `'${value}`;
	}
	return value;
}

/**
 * Sets proper HTTP response headers for streaming Excel downloads.
 */
export function setupExcelHeaders(res: Response, fileName: string): void {
	res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
	res.setHeader(
		'Content-Disposition',
		`attachment; filename="${encodeURIComponent(fileName)}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
	);
}

/**
 * Streams application records from a Mongoose Cursor directly into an Excel worksheet.
 */
export const generateApplicationsExcelStream = async (res: Response, data: Cursor<IApplicationWData>): Promise<void> => {
	// Correct property is 'stream', NOT 'response'
	const workbookWriter = new ExcelJS.stream.xlsx.WorkbookWriter({
		stream: res,
		useSharedStrings: true,
		useStyles: true,
	});

	const worksheet = workbookWriter.addWorksheet('Applications', {
		pageSetup: {
			margins: {
				left: 0.7,
				right: 0.7,
				top: 0.75,
				bottom: 0.75,
				header: 0.3,
				footer: 0.3,
			},
		},
	});

	// Setup sheet columns with matching keys
	worksheet.columns = [
		{ header: 'Job Title', key: 'jobTitle', width: 30 },
		{ header: 'Candidate Name', key: 'candidate', width: 30 },
		{ header: 'Email', key: 'email', width: 30 },
		{ header: 'Resume URL', key: 'resume', width: 35 },
		{ header: 'Status', key: 'status', width: 15 },
		{ header: 'Applied At', key: 'createdAt', width: 22 },
	];

	// Style header row
	const headerRow = worksheet.getRow(1);
	headerRow.font = { bold: true, color: { argb: 'FFFFFF' }, size: 11 };
	headerRow.fill = {
		type: 'pattern',
		pattern: 'solid',
		fgColor: { argb: '1F4E78' },
	};
	headerRow.commit();

	// Stream each row securely
	await data.eachAsync((application: IApplicationWData) => {
		const candidateName =
			application.userId?.username ||
			`${application.userId?.firstName || ''} ${application.userId?.lastName || ''}`.trim() ||
			'N/A';

		const row = worksheet.addRow({
			jobTitle: sanitizeExcelCell(application.jobId?.jobTitle || '-'),
			candidate: sanitizeExcelCell(candidateName),
			email: sanitizeExcelCell(application.userId?.email || '-'),
			resume: sanitizeExcelCell(application.userCV?.secure_url || '-'),
			status: sanitizeExcelCell(application.status || '-'),
			createdAt: sanitizeExcelCell(application.createdAt ? new Date(application.createdAt).toISOString() : '-'),
		});

		row.commit();
	});

	await worksheet.commit();
	await workbookWriter.commit();
};
