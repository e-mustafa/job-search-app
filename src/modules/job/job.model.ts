import { Model, model, Schema } from 'mongoose';
import mongooseLeanVirtuals from 'mongoose-lean-virtuals';
import { JobLocationEnum, SeniorityLevelEnum, WorkingTimeEnum } from './job.enum';
import { IJob } from './job.types';

const jobSchema = new Schema<IJob>(
	{
		jobTitle: {
			type: String,
			required: [true, 'Job title is required'],
			minLength: [3, 'Job title must be at least 3 characters long'],
			maxLength: [100, 'Job title must be at most 100 characters long'],
		},
		jobLocation: {
			type: String,
			enum: Object.values(JobLocationEnum),
			default: JobLocationEnum.ONSITE,
			required: true,
		},

		workingTime: {
			type: String,
			enum: Object.values(WorkingTimeEnum),
			default: WorkingTimeEnum.FULL_TIME,
			required: true,
		},

		seniorityLevel: {
			type: String,
			enum: Object.values(SeniorityLevelEnum),
			default: SeniorityLevelEnum.JUNIOR,
			required: true,
		},

		jobDescription: {
			type: String,
			required: [true, 'Job description is required'],
			minLength: [3, 'Job description must be at least 3 characters long'],
			maxLength: [2000, 'Job description must be at most 2000 characters long'],
		},

		technicalSkills: {
			type: [String],
			required: [true, 'Technical skills are required'],
		},
		softSkills: {
			type: [String],
			required: [true, 'Soft skills are required'],
		},
		addedBy: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: [true, 'User is required'],
		},
		updatedBy: {
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
		companyId: {
			type: Schema.Types.ObjectId,
			ref: 'Company',
			required: [true, 'Company is required'],
		},
		closed: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
		validateBeforeSave: true,
		optimisticConcurrency: true,
		id: true,
		toObject: { virtuals: true },
		toJSON: { virtuals: true },
	},
);

// use mongoose-lean-virtuals to get virtuals in lean queries
jobSchema.plugin(mongooseLeanVirtuals);

// Indexes ------------------------------------
jobSchema.index({ jobTitle: 1, createdAt: -1 });
jobSchema.index({ workingTime: 1, createdAt: -1 });
jobSchema.index({ jobLocation: 1, createdAt: -1 });
jobSchema.index({ seniorityLevel: 1, createdAt: -1 });

// jobSchema.virtual('applications', {
// 	localField: '_id',
// 	foreignField: 'jobId',
// 	ref: 'Application',
// });

const Job: Model<IJob> = model<IJob>('Job', jobSchema);

export default Job;
