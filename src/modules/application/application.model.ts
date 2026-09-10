import { Model, model, Schema } from 'mongoose';
import { ImageSchema } from '../user/user.model';
import { ApplicationStatusEnum } from './application.enum';
import { IApplication } from './application.types';

const applicationSchema = new Schema<IApplication>(
	{
		jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
		userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
		userCV: {
			type: ImageSchema,
			default: null,
			nullable: true,
		},
		status: {
			type: String,
			enum: Object.values(ApplicationStatusEnum),
			default: ApplicationStatusEnum.PENDING,
			required: true,
		},
	},
	{ timestamps: true },
);

// Unique compound index preventing a user from applying to the same job twice
applicationSchema.index({ jobId: 1, userId: 1 }, { unique: true });
applicationSchema.index({ companyId: 1, createdAt: -1 });
applicationSchema.index({ status: -1 });

// Virtuals
applicationSchema.virtual('candidate', {
	localField: 'userId',
	foreignField: '_id',
	ref: 'User',
	justOne: true,
});

const Application: Model<IApplication> = model<IApplication>('Application', applicationSchema);

export default Application;
