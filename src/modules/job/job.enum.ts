export const JobLocationEnum = {
	ONSITE: 'onsite',
	REMOTELY: 'remotely',
	HYBRID: 'hybrid',
} as const;

export type TJobLocation = (typeof JobLocationEnum)[keyof typeof JobLocationEnum];

export const WorkingTimeEnum = {
	FULL_TIME: 'full-time',
	PART_TIME: 'part-time',
	INTERNSHIP: 'internship',
} as const;

export type TWorkingTime = (typeof WorkingTimeEnum)[keyof typeof WorkingTimeEnum];

export const SeniorityLevelEnum = {
	SENIOR: 'senior',
	JUNIOR: 'junior',
	MIDDLE: 'middle',
	FRESH: 'fresh',
	TEAM_LEAD: 'team-lead',
	CTO: 'cto',
} as const;

export type TSeniorityLevel = (typeof SeniorityLevelEnum)[keyof typeof SeniorityLevelEnum];
