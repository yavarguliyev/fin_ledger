import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { LedgerAccountDto } from '../../dtos/account/ledger-account.dto';
import { CreateLedgerAccountDto } from '../../dtos/input/create-ledger-account.dto';
import { LedgerBaseUseCase } from '../base/base-ledger.use-case';

@Injectable()
export class CreateLedgerAccountUseCase extends LedgerBaseUseCase<CreateLedgerAccountDto, LedgerAccountDto> {
  async execute (dto: CreateLedgerAccountDto): Promise<LedgerAccountDto> {
    const account = await this.ledgerAccountRepository.createAccount(dto);
    if (!account) throw new InternalServerErrorException('Failed to create ledger account');
    return account;
  }
}
