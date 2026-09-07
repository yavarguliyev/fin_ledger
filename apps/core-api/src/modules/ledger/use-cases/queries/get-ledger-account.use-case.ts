import { Injectable } from '@nestjs/common';

import { LedgerAccountRepository } from '../../repositories/ledger-account.repository';
import { LedgerAccountDto } from '../../dtos/account/ledger-account.dto';
import { LedgerBaseUseCase } from '../base/base-ledger.use-case';

@Injectable()
export class GetLedgerAccountUseCase extends LedgerBaseUseCase<string, LedgerAccountDto | null> {
  constructor (private readonly ledgerAccountRepository: LedgerAccountRepository) {
    super();
  }

  async execute (id: string): Promise<LedgerAccountDto | null> {
    return this.ledgerAccountRepository.findById(id);
  }
}
