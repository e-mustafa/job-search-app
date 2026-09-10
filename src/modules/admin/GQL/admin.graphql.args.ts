import { GraphQLEnumType, GraphQLInt, GraphQLString } from 'graphql';

export const getUsersArgs = {
	page: { type: GraphQLInt },
	limit: { type: GraphQLInt },
	order: {
		type: new GraphQLEnumType({ name: 'OrderUsers', values: { ASC: { value: 'asc' }, DESC: { value: 'desc' } } }),
	},
	search: { type: GraphQLString },
};

export const getCompaniesArgs = {
	page: { type: GraphQLInt },
	limit: { type: GraphQLInt },
	order: {
		type: new GraphQLEnumType({ name: 'OrderCompanies', values: { ASC: { value: 'asc' }, DESC: { value: 'desc' } } }),
	},
	search: { type: GraphQLString },
};
