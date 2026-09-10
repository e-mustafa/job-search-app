export const ApplicationStatusEnum = {
	PENDING: 'pending',
	VIEWED: 'viewed',
	CONSIDERATION: 'consideration',
	ACCEPTED: 'accepted',
	REJECTED: 'rejected',
} as const;

export type TApplicationStatus = (typeof ApplicationStatusEnum)[keyof typeof ApplicationStatusEnum];
