import { GraphQLObjectType, GraphQLSchema } from 'graphql';
import { getCompaniesArgs, getUsersArgs } from './admin.graphql.args';
import { getCompaniesResolver, getUsersResolver } from './admin.graphql.controller';
import { QPaginatedResult_getCompanies, QPaginatedResult_getUsers } from './admin.graphql.types';

const query = new GraphQLObjectType({
	name: 'adminQuery',
	fields: {
		getUsers: {
			type: QPaginatedResult_getUsers,
			args: getUsersArgs,
			resolve: getUsersResolver,
		},

		getCompanies: {
			type: QPaginatedResult_getCompanies,
			args: getCompaniesArgs,
			resolve: getCompaniesResolver,
		},
	},
});

// const mutation = new GraphQLObjectType({
// 	name: 'adminMutation',
// 	fields: {},
// });

const adminGraphqlSchema = new GraphQLSchema({ query });

export default adminGraphqlSchema;
