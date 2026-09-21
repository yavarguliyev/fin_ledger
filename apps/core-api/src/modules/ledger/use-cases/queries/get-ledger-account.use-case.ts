import { Injectable } from '@nestjs/common';

import { LedgerAccountDto } from '../../dtos/account/ledger-account.dto';
import { GetLedgerAccountDto } from '../../dtos/request/get-ledger-account.dto';
import { LedgerBaseUseCase } from '../base/base-ledger.use-case';

@Injectable()
export class GetLedgerAccountUseCase extends LedgerBaseUseCase<GetLedgerAccountDto, LedgerAccountDto | null> {
  async execute ({ id }: GetLedgerAccountDto): Promise<LedgerAccountDto | null> {
    return this.ledgerAccountRepository.findById({ id });
  }
}
