import { Injectable } from '@nestjs/common';
import { ResourceOwnerGuard, ResourceOwnershipDto } from '@common/libs';

import { LedgerAccountRepository } from '../repositories/ledger-account.repository';

@Injectable()
export class LedgerAccountAccessGuard extends ResourceOwnerGuard {
  protected readonly resourceName = 'Ledger account';

  constructor (private readonly ledgerAccountRepository: LedgerAccountRepository) {
    super();
  }

  protected async isOwnedBy ({ resourceId, userId }: ResourceOwnershipDto): Promise<boolean> {
    const account = await this.ledgerAccountRepository.findById({ id: resourceId });
    return account?.userId === userId;
  }
}
