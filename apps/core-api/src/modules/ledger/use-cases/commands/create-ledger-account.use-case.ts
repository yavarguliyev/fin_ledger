import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { LedgerAccountRepository } from '../../repositories/ledger-account.repository';
import { LedgerAccountDto } from '../../dtos/account/ledger-account.dto';
import { LedgerBaseUseCase } from '../base/base-ledger.use-case';
import { CreateLedgerAccount } from '../../dtos/account/create-account.dto';
import { AccountType } from '@common/libs';

@Injectable()
export class CreateLedgerAccountUseCase extends LedgerBaseUseCase<CreateLedgerAccount, LedgerAccountDto> {
  constructor (private readonly ledgerAccountRepository: LedgerAccountRepository) {
    super();
  }

  async execute ({ userId, accountType, currency, adapter }: CreateLedgerAccount): Promise<LedgerAccountDto> {
    const account = await this.ledgerAccountRepository.createAccount(userId, accountType as AccountType, currency, adapter);
    if (!account) throw new InternalServerErrorException('Failed to create ledger account');
    return account;
  }
}
