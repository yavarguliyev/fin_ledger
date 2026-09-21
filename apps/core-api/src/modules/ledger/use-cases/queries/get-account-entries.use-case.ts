import { Injectable } from '@nestjs/common';
import { PaginatedResponseDto, STAFF_ROLES } from '@common/libs';

import { LedgerEntryResponseDto } from '../../dtos/entry/ledger-entry-response.dto';
import { ListAccountEntriesDto } from '../../dtos/input/list-account-entries.dto';
import { LedgerBaseUseCase } from '../base/base-ledger.use-case';

@Injectable()
export class GetAccountEntriesUseCase extends LedgerBaseUseCase<ListAccountEntriesDto, PaginatedResponseDto<LedgerEntryResponseDto>> {
  async execute (dto: ListAccountEntriesDto): Promise<PaginatedResponseDto<LedgerEntryResponseDto>> {
    const { id, page, limit, role } = dto;
    const isStaff = role && STAFF_ROLES.includes(role);
    const criteria = { ...(!isStaff && { accountId: id }), limit, offset: (page - 1) * limit };

    const [entries, total] = await Promise.all([this.ledgerEntryRepository.findPaginated(criteria), this.ledgerEntryRepository.countEntries(criteria)]);
    return new PaginatedResponseDto({ data: entries, total, page, pageSize: limit });
  }
}
