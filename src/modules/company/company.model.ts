import { HydratedDocument, Model, model, Query, Schema } from 'mongoose';
import Application from '../application/application.model';
import Job from '../job/job.model';
import { ImageSchema } from '../user/user.model';
import { ICompany } from './company.types';

export const attachmentsSchemaDB = {
	type: {
		public_id: { type: String, required: true },
		secure_url: { type: String, required: true },
		resourceType: { type: String, required: true },
	},

	_id: false,
};

const companySchema = new Schema<ICompany>(
	{
		companyName: {
			type: String,
			required: [true, 'Company name is required'],
			minLength: [3, 'Company name must be at least 3 characters long'],
			maxLength: [100, 'Company name must be at most 100 characters long'],
			unique: true,
		},
		companyEmail: {
			type: String,
			required: [true, 'Email required.'],
			unique: [true, 'Email must be unique, entered email already in use!'],
			maxLength: [50, 'FirstName must be at most 30 characters'],
			trim: true,
			lowercase: true,
			match: [/^\w+([-.]?\w+)*@\w+([-.]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email'],
		},
		description: {
			type: String,
			required: [true, 'Description is required'],
			minLength: [3, 'Description must be at least 3 characters long'],
			maxLength: [2000, 'Description must be at most 2000 characters long'],
		},
		industry: String,
		address: String,
		numberOfEmployees: String,

		website: String,
		logo: ImageSchema,
		coverPic: ImageSchema,
		createdBy: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: [true, 'CreatedBy is required'],
		},

		legalAttachment: attachmentsSchemaDB,

		deletedAt: Date,
		bannedAt: Date,

		approvedByAdmin: {
			type: Boolean,
			default: false,
		},

		HRs: [{ type: Schema.Types.ObjectId, ref: 'User' }],
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

// Index for author's timeline/profile posts
companySchema.index({ companyEmail: 1, createdAt: 1 });
companySchema.index({ companyName: 1, createdAt: 1 });
companySchema.index({ approvedByAdmin: 1, createdAt: 1 });
companySchema.index({ deletedAt: 1, createdAt: 1 });
companySchema.index({ bannedAt: 1, createdAt: 1 });

// virtuals ------------------------------------
companySchema.virtual('jobs', {
	localField: '_id',
	foreignField: 'companyId',
	ref: 'Job',
	// perDocumentLimit: 20,
	sort: { createdAt: -1 },
	match: { $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }] },
});

// Document Middleware: Triggers on `doc.deleteOne()` and `doc.findOneAndDelete()`
companySchema.pre('deleteOne', { document: true, query: false }, async function (this: HydratedDocument<ICompany>) {
	// Delete all comments associated with this company ID
	await Job.deleteMany({ companyId: this._id });
	await Application.deleteMany({ companyId: this._id });
});

companySchema.pre(
	'findOneAndDelete',
	{ document: false, query: true },
	async function (this: Query<ICompany | null, ICompany>) {
		const docToDelete = await this.model.findOne<HydratedDocument<ICompany>>(this.getFilter());
		// Delete all comments associated with this company ID
		if (docToDelete) {
			await Job.deleteMany({ companyId: docToDelete._id });
			await Application.deleteMany({ companyId: docToDelete._id });
		}
	},
);

const Company: Model<ICompany> = model<ICompany>('Company', companySchema);
export default Company;
