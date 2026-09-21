import { Injectable } from '@nestjs/common';
import { BaseExtendedRepository, PostgresService, AccountOwnerType } from '@common/libs';

import { LedgerAccountDto } from '../dtos/account/ledger-account.dto';
import { CreateLedgerAccountDto } from '../dtos/input/create-ledger-account.dto';

@Injectable()
export class LedgerAccountRepository extends BaseExtendedRepository<LedgerAccountDto> {
  constructor (postgresService: PostgresService) {
    super({
      service: postgresService,
      tableName: 'ledger_accounts',
      columnMappings: {
        userId: 'user_id',
        ownerType: 'owner_type',
        accountType: 'account_type',
        balanceMinor: 'balance_minor',
        isActive: 'is_active',
        createdAt: 'created_at',
        updatedAt: 'updated_at'
      }
    });
  }

  protected getSelectColumns (): string[] {
    return ['id', 'userId', 'ownerType', 'code', 'accountType', 'currency', 'balanceMinor', 'isActive', 'version', 'createdAt', 'updatedAt'];
  }

  async createAccount (dto: CreateLedgerAccountDto): Promise<LedgerAccountDto | null> {
    const { userId, accountType, currency, adapter } = dto;

    return this.create({ data: { userId, ownerType: AccountOwnerType.USER, accountType, currency, balanceMinor: 0 }, adapter });
  }
}
