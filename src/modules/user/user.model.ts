import { model, Schema } from 'mongoose';
import mongooseLeanVirtuals from 'mongoose-lean-virtuals';
import { IImage } from '../../shared/types';
import { calcAge } from '../../utils/general/date';
import { decrypt, encrypt, isEncrypted } from '../../utils/security/encryption.security';
import { generateHash } from '../../utils/security/hash.security';
import { GenderEnum, otpTypeEnum, ProviderEnum, RoleEnum } from './user.enums';
import { IUser } from './user.types';

export const ImageSchema = new Schema<IImage>(
	{
		// id: { type: String, required: true, trim: true },
		// url: { type: String, required: true, trim: true },
		public_id: { type: String, required: true, trim: true },
		secure_url: { type: String, required: true, trim: true },
	},
	{ _id: false },
);

const userSchema = new Schema<IUser>(
	{
		firstName: {
			type: String,
			required: [true, 'FirstName required.'],
			minLength: [3, 'FirstName must be at least 3 characters'],
			maxLength: [30, 'FirstName must be at most 30 characters'],
			trim: true,
		},
		lastName: {
			type: String,
			required: [true, 'LastName required.'],
			minLength: [2, 'LastName must be at least 2 characters'],
			maxLength: [30, 'LastName must be at most 30 characters'],
			trim: true,
		},
		email: {
			type: String,
			required: [true, 'Email required.'],
			unique: [true, 'Email must be unique, entered email already in use!'],
			maxLength: [50, 'FirstName must be at most 30 characters'],
			trim: true,
			lowercase: true,
			match: [/^\w+([-.]?\w+)*@\w+([-.]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email'],
		},
		password: {
			type: String,
			required: [
				function () {
					return this.provider === ProviderEnum.SYSTEM;
				},
				'Password required.',
			],
			minLength: [8, 'Password must be at least 8 characters'],
		},

		provider: {
			type: String,
			enum: {
				values: Object.values(ProviderEnum),
				message: "'{VALUE}' is not a valid provider",
			},
			default: ProviderEnum.SYSTEM,
		},

		role: {
			type: Number,
			enum: Object.values(RoleEnum),
			default: RoleEnum.USER,
		},

		gender: {
			type: Number,
			enum: Object.values(GenderEnum),
			default: GenderEnum.MALE,
		},

		bio: String,

		avatar: {
			type: ImageSchema,
			default: null,
			nullable: true,
		},

		cover: {
			type: ImageSchema,
			default: null,
			nullable: true,
		},

		DOB: {
			type: Date,
			validate: {
				validator: function (value: Date) {
					return (calcAge(value) || 0) >= 18;
				},
				message: 'Age must be at least 18 years old!',
			},
		},
		mobileNumber: {
			type: String,
			set: function (value: string) {
				if (!value) return value;
				if (isEncrypted(value)) return value;

				return encrypt(value);
			},
		},

		isConfirmed: {
			type: Date,
		},

		loggedOutAllAt: Date,
		changeCredentialTime: Date,

		updatedBy: {
			type: Schema.Types.ObjectId,
			ref: 'User',
		},

		deviceTokens: [String],
		notificationEnabled: {
			type: Boolean,
			default: true,
		},

		// status: {
		// 	type: String,
		// 	enum: Object.values(UserStatusEnum),
		// 	default: UserStatusEnum.ACTIVE,
		// },
		// statusReason: { type: String, enum: Object.values(StatusReasonEnum) },
		// statusChangedAt: { type: Date },

		deletedAt: Date,
		bannedAt: Date,

		lastSeenAt: {
			type: Date,
		},
		// {code(Hashed), type(confirmEmail,forgetPassword),expiresIn:Date}
		otp: {
			type: [
				{
					code: String,
					expiresAt: Date,
					otpType: {
						type: String,
						enum: Object.values(otpTypeEnum),
					},
				},
			],
			_id: false,
		},
	},
	{
		timestamps: true,
		validateBeforeSave: true,
		optimisticConcurrency: true,
		id: true,
		toObject: { virtuals: true },
		toJSON: {
			virtuals: true,
			getters: true,
			transform(_doc, ret) {
				ret.id = ret._id.toString();
				delete ret.password;
				// delete ret._id;
				// delete ret.__v;
				console.log('ret.mobileNumber', ret.mobileNumber);

				if (typeof ret.mobileNumber === 'string') {
					ret.mobileNumber = decrypt(ret.mobileNumber);
				}
				return ret;
			},
		},
	},
);

// use mongoose-lean-virtuals to get virtuals in lean queries
userSchema.plugin(mongooseLeanVirtuals);

// indexing ------------------------------------
// Compound index for active and non-deleted user queries
userSchema.index({ deletedAt: 1, status: 1 });

// virtuals ------------------------------------
userSchema.virtual('username').get(function () {
	if (!this.firstName || !this.lastName) return '';
	return `${this.firstName} ${this.lastName || ''}`.trim();
});

// userSchema.set('toJSON', {
// 	virtuals: true,
// 	transform(doc, ret) {
// 		ret.id = ret._id.toString();
// 		delete ret.password;
// 		// delete ret._id;
// 		// delete ret.__v;
// 		console.log('ret.mobileNumber', ret.mobileNumber);

// 		if (typeof ret.mobileNumber === 'string') {
// 			ret.mobileNumber = decrypt(ret.mobileNumber);
// 		}
// 		return ret;
// 	},
// });

// middlewares ------------------------------------
// Document Middleware: Hash password on document save()
userSchema.pre('save', async function () {
	if (this.password && this.isModified('password')) {
		this.password = await generateHash(this.password, undefined, true);
	}

	// if (this.mobileNumber && this.isModified('mobileNumber')) {
	// 	this.mobileNumber = encrypt(this.mobileNumber);
	// }
});

const User = model<IUser>('User', userSchema);
export default User;
