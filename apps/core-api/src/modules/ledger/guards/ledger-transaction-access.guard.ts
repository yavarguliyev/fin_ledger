import { Injectable } from '@nestjs/common';
import { ResourceOwnerGuard, ResourceOwnershipDto } from '@common/libs';

import { LedgerAccountRepository } from '../repositories/ledger-account.repository';
import { LedgerEntryRepository } from '../repositories/ledger-entry.repository';

@Injectable()
export class LedgerTransactionAccessGuard extends ResourceOwnerGuard {
  protected readonly resourceName = 'Ledger transaction';

  constructor (
    private readonly ledgerEntryRepository: LedgerEntryRepository,
    private readonly ledgerAccountRepository: LedgerAccountRepository
  ) {
    super();
  }

  protected async isOwnedBy ({ resourceId, userId }: ResourceOwnershipDto): Promise<boolean> {
    const entries = await this.ledgerEntryRepository.findByTransactionId({ transactionId: resourceId });
    const accountIds = [...new Set(entries.map(entry => entry.accountId))];
    const accounts = await Promise.all(accountIds.map(id => this.ledgerAccountRepository.findById({ id })));

    return accounts.some(account => account?.userId === userId);
  }
}
