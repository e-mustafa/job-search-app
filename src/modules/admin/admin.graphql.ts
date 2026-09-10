// import { companyRepository, ICompanyWUsers } from '../company';
// import { userRepository } from '../user';

// export const adminResolvers = {
// 	Query: {
// 		getAdminDashboardData: async (parent: any, args: any, context: any) => {
// 			const [users, companies] = await Promise.all([
// 				userRepository
// 					.find({ _id: { $ne: user?._id } }, { ignoreDefaultFilters: true })
// 					.lean()
// 					.select('-password -otp')
// 					.paginate(1, 20)
// 					.exec(),
// 				companyRepository
// 					.find({}, { ignoreDefaultFilters: true })
// 					.lean()
// 					.paginate(1, 20)
// 					.populate<ICompanyWUsers>([
// 						{ path: 'createdBy', select: 'firstName lastName avatar' },
// 						{ path: 'hrs', select: 'firstName lastName avatar' },
// 					])
// 					.exec(),
// 			]);
// 			return { users, companies };
// 		},
// 	},
// };
