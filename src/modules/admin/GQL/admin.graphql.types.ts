import {
	GraphQLBoolean,
	GraphQLEnumType,
	GraphQLID,
	GraphQLList,
	GraphQLNonNull,
	GraphQLObjectType,
	GraphQLString,
} from 'graphql';
import { createPaginatedResultType } from '../../graphQL/graphql.types';
import { GenderEnum, ProviderEnum, RoleEnum } from '../../user/user.enums';

export const QImageType = new GraphQLObjectType({
	name: 'QImageType',
	fields: {
		public_id: { type: GraphQLString },
		secure_url: { type: GraphQLString },
	},
});

export const QAttachmentType = new GraphQLObjectType({
	name: 'QAttachmentType',
	fields: {
		public_id: { type: GraphQLString },
		secure_url: { type: GraphQLString },
		resourceType: {
			type: new GraphQLEnumType({
				name: 'ResourceType',
				values: { IMAGE: { value: 'image' }, VIDEO: { value: 'video' }, ROW: { value: 'row' } },
			}),
		},
	},
});

export const QUserType = new GraphQLObjectType({
	name: 'QUserType',
	fields: {
		_id: { type: new GraphQLNonNull(GraphQLID) },
		id: { type: GraphQLString },
		firstName: { type: GraphQLString },
		lastName: { type: GraphQLString },
		username: { type: GraphQLString },
		email: { type: GraphQLString },
		bio: { type: GraphQLString },

		avatar: { type: QImageType },
		cover: { type: QImageType },
		mobileNumber: { type: GraphQLString },
		DOB: { type: GraphQLString },

		gender: {
			type: new GraphQLEnumType({
				name: 'Gender',
				values: { MALE: { value: GenderEnum.MALE }, FEMALE: { value: GenderEnum.FEMALE } },
			}),
		},
		role: {
			type: new GraphQLEnumType({
				name: 'Role',
				values: { USER: { value: RoleEnum.USER }, ADMIN: { value: RoleEnum.ADMIN } },
			}),
		},
		provider: {
			type: new GraphQLEnumType({
				name: 'Provider',
				values: { SYSTEM: { value: ProviderEnum.SYSTEM }, GOOGLE: { value: ProviderEnum.GOOGLE } },
			}),
		},

		isConfirmed: { type: GraphQLBoolean },

		bannedAt: { type: GraphQLString },
		deletedAt: { type: GraphQLString },
		createdAt: { type: GraphQLString },
		updatedAt: { type: GraphQLString },
	},
});

export const QCompanyType = new GraphQLObjectType({
	name: 'QCompanyType',
	fields: {
		_id: { type: new GraphQLNonNull(GraphQLID) },
		id: { type: GraphQLString },
		companyName: { type: GraphQLString },
		companyEmail: { type: GraphQLString },
		description: { type: GraphQLString },
		industry: { type: GraphQLString },
		address: { type: GraphQLString },
		numberOfEmployees: { type: GraphQLString },
		website: { type: GraphQLString },

		logo: { type: QImageType },
		coverPic: { type: QImageType },
		legalAttachment: { type: QAttachmentType },

		createdBy: { type: QUserType },
		HRs: { type: new GraphQLList(QUserType) },

		approvedByAdmin: { type: GraphQLBoolean },

		bannedAt: { type: GraphQLString },
		deletedAt: { type: GraphQLString },
		createdAt: { type: GraphQLString },
		updatedAt: { type: GraphQLString },
	},
});

// export const QPaginatedResult_getUsers = new GraphQLObjectType({
// 	name: 'QPaginatedResult_getUsers',
// 	fields: {
// 		data: { type: new GraphQLList(QUserType) },
// 		metadata: { type: QPaginationMetaDataType },
// 	},
// });

export const QPaginatedResult_getUsers = createPaginatedResultType('QPaginatedResult_getUsers', QUserType);
export const QPaginatedResult_getCompanies = createPaginatedResultType('QPaginatedResult_getCompanies', QCompanyType);