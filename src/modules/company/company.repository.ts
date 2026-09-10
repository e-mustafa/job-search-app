import { QueryFilter } from 'mongoose';
import { BaseRepository } from '../../DB/base.repository';
import Company from './company.model';
import { ICompany } from './company.types';

export class CompanyRepository extends BaseRepository<ICompany> {
	protected activeFilter: QueryFilter<ICompany> = {
		$or: [{ deletedAt: { $exists: false } }, { deletedAt: null }, { bannedAt: { $exists: false } }, { bannedAt: null }],
	};

	constructor(private customFilter?: QueryFilter<ICompany>) {
		super(Company);
	}

	protected override getDefaultFilter() {
		if (!this.customFilter) return this.activeFilter;
		return { $and: [this.activeFilter, this.customFilter] };
	}
}

export default new CompanyRepository();
