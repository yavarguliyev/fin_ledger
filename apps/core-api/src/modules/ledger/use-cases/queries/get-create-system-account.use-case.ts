import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AccountType, AUTH_CONSTANTS } from '@common/libs';

import { LedgerAccountRepository } from '../../repositories/ledger-account.repository';
import { AuthRepository } from '../../../auth/repositories/auth.repository';
import { LedgerBaseUseCase } from '../base/base-ledger.use-case';
import { GetCreateSystemAccountDto } from '../../dtos/account/get-create-system-account.dto';

@Injectable()
export class GetCreateSystemAccountUseCase extends LedgerBaseUseCase<GetCreateSystemAccountDto, string> {
  constructor (
    private readonly authRepository: AuthRepository,
    private readonly ledgerAccountRepository: LedgerAccountRepository
  ) {
    super();
  }

  async execute ({ currency, adapter }: GetCreateSystemAccountDto): Promise<string> {
    const adminUser = await this.authRepository.findByEmail(AUTH_CONSTANTS.GLOBAL_ADMIN_EMAIL, adapter);
    if (!adminUser) throw new InternalServerErrorException('Global admin user not found');

    const existingAccount = await this.ledgerAccountRepository.findOne({ user_id: adminUser.id, account_type: AccountType.ASSET, currency }, adapter);
    if (existingAccount) return existingAccount.id;

    const newAccount = await this.ledgerAccountRepository.createAccount(adminUser.id, AccountType.ASSET, currency, adapter);
    if (!newAccount) throw new InternalServerErrorException('Failed to create ledger account');

    return newAccount.id;
  }
}
