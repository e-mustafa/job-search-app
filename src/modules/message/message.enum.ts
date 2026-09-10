export const ReactionTypeEnum = {
	LIKE: 'like',
	LOVE: 'love',
	HAHA: 'haha',
	WOW: 'wow',
	SAD: 'sad',
	ANGRY: 'angry',
	DISLIKE: 'dislike',
} as const;

export type TReactionType = (typeof ReactionTypeEnum)[keyof typeof ReactionTypeEnum];

// export const MessageStatusEnum = {
// 	SENT: 'sent',
// 	DELIVERED: 'delivered',
// 	READ: 'read',
// } as const;

// export type TMessageStatus = (typeof MessageStatusEnum)[keyof typeof MessageStatusEnum];
