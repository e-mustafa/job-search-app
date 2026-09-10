import { Router } from 'express';
import { createHandler } from 'graphql-http/lib/use/express';
import { auth, authAdmin } from '../../middlewares/auth.middleware';
import { validation } from '../../middlewares/validation.middleware';
import * as C from './admin.controller';
import * as V from './admin.validation';
import adminGraphqlSchema from './GQL/admin.graphql.schema';

const router = Router();

export const routes = {
	base: '/admin',
	graphql: '/graphql',

	toggleBanUser: '/users/:userId/toggle-ban',
	toggleBanCompany: '/companies/:companyId/toggle-ban',
	approveCompany: '/companies/:companyId/approve',
};

// apply auth and authAdmin middleware for all routes in this router
router.use(routes.base, auth(), authAdmin());

// User -----------------------------------------------------
router.patch(routes.toggleBanUser, validation(V.paramsUserIdSchema), C.toggleBanUser);

// Company --------------------------------------------------
router.patch(routes.toggleBanCompany, validation(V.paramsCompanyIdSchema), C.toggleBanCompany);
router.patch(routes.approveCompany, validation(V.paramsCompanyIdSchema), C.approveCompany);

// GraphQL -------------------------------------------------
router.all(
	routes.graphql,
	// TODO: Add graphQL validation
	createHandler({
		schema: adminGraphqlSchema,
		// context: (req) => ({ req  }),
		context: (req) => {
			// Extract user and decoded from the underlying raw Node/Express request
			const rawReq = req.raw;
			return { req: rawReq, user: rawReq.user, decoded: rawReq.decoded };
		},
	}),
);

export default router;
