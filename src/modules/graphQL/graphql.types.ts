import { GraphQLBoolean, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLOutputType } from 'graphql';

export const QPaginationMetaDataType = new GraphQLObjectType({
	name: 'QPaginationMetaDataType',
	fields: {
		page: { type: GraphQLInt },
		limit: { type: GraphQLInt },
		total: { type: GraphQLInt },
		totalPages: { type: GraphQLInt },
		hasNext: { type: GraphQLBoolean },
		hasPrev: { type: GraphQLBoolean },
	},
});

/**
 * Creates a generic GraphQL paginated wrapper type.
 * @param typeName The unique name for the generated GraphQL Object Type.
 * @param itemType The GraphQL type of the data items inside the paginated list.
 */
export const createPaginatedResultType = <T extends GraphQLOutputType>(typeName: string, itemType: T): GraphQLObjectType => {
	return new GraphQLObjectType({
		name: typeName,
		fields: () => ({
			data: { type: new GraphQLList(itemType) },
			metadata: { type: QPaginationMetaDataType },
		}),
	});
};
