import { Injectable } from '@nestjs/common';
import { BaseExtendedRepository, PostgresService, DatabaseAdapter, AccountType } from '@common/libs';

import { LedgerAccountDto } from '../dtos/account/ledger-account.dto';

@Injectable()
export class LedgerAccountRepository extends BaseExtendedRepository<LedgerAccountDto> {
  constructor (postgresService: PostgresService) {
    super(postgresService, 'ledger_accounts', {
      userId: 'user_id',
      accountType: 'account_type',
      balanceMinor: 'balance_minor',
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    });
  }

  protected getSelectColumns (): string[] {
    return ['id', 'userId', 'accountType', 'currency', 'balanceMinor', 'createdAt', 'updatedAt'];
  }

  async createAccount (userId: string, accountType: AccountType, currency: string, adapter?: DatabaseAdapter): Promise<LedgerAccountDto | null> {
    return this.create({ userId, accountType, currency, balanceMinor: 0 }, undefined, adapter);
  }

  async adjustBalance (accountId: string, deltaMinor: number, adapter?: DatabaseAdapter): Promise<void> {
    await this.increment(accountId, 'balanceMinor', deltaMinor, adapter);
  }
}
