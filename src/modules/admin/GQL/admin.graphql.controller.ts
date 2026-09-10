import { GraphQLParseContext } from 'graphql';
import { sortOrderEnum } from '../../../shared/enums/query.enum';
import { IUserBody } from '../../../shared/types';
import { IQueryDTO } from '../../../shared/validation/general-fields.validation';
import { IJwtPayload } from '../../../utils/security/token/token.types';
import adminServices from '../admin.service';

interface GraphQLContext extends GraphQLParseContext {
	user: IUserBody;
	decoded: IJwtPayload;
}

export const getUsersResolver = async (_parent: unknown, args: IQueryDTO, context: GraphQLContext) => {
	const user: IUserBody = context.user;
	const { page = 1, limit = 10, order = sortOrderEnum.DESC, search = '' } = args;

	return adminServices.getUsers(user, { page, limit, order, search });
};

export const getCompaniesResolver = async (_parent: unknown, args: IQueryDTO, context: GraphQLContext) => {
	const user: IUserBody = context.user;
	const { page = 1, limit = 10, order = sortOrderEnum.DESC, search = '' } = args;

	return adminServices.getCompanies(user, { page, limit, order, search });
};
