import { GraphQLObjectType, GraphQLSchema } from 'graphql';
import adminGraphqlSchema from '../admin/GQL/admin.graphql.schema';

const query = new GraphQLObjectType({
	name: 'userQuery',
	fields: {
		// ...adminGraphqlSchema.registerQuery(),
	},
});

// const mutation = new GraphQLObjectType({
// 	name: 'adminMutation',
// 	fields: {
// 		// ...adminQuery,
// 	},
// });

const graphQlSchema = new GraphQLSchema({ query }); // mutation});

export default graphQlSchema;
