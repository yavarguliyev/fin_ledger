import { Injectable } from '@nestjs/common';
import { STAFF_ROLES } from '@common/libs';

import { LedgerEntryResponseDto } from '../../dtos/entry/ledger-entry-response.dto';
import { ListAccountEntriesDto } from '../../dtos/input/list-account-entries.dto';
import { LedgerBaseUseCase } from '../base/base-ledger.use-case';

@Injectable()
export class GetAccountEntriesUseCase extends LedgerBaseUseCase<ListAccountEntriesDto, LedgerEntryResponseDto[]> {
  async execute ({ id, limit, before, beforeId, role }: ListAccountEntriesDto): Promise<LedgerEntryResponseDto[]> {
    const isStaff = role && STAFF_ROLES.includes(role);
    return this.ledgerEntryRepository.findPage({ ...(!isStaff && { accountId: id }), limit, ...(before && { before }), ...(beforeId && { beforeId }) });
  }
}
