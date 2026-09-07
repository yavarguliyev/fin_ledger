import { Injectable } from '@nestjs/common';
import { PaginatedResponseDto, UserRoles } from '@common/libs';

import { LedgerEntryRepository } from '../../repositories/ledger-entry.repository';
import { LedgerEntryResponseDto } from '../../dtos/entry/ledger-entry-response.dto';
import { LedgerBaseUseCase } from '../base/base-ledger.use-case';
import { GetAccountEntriesDto } from '../../dtos/entry/get-account-entries.dto';

@Injectable()
export class GetAccountEntriesUseCase extends LedgerBaseUseCase<GetAccountEntriesDto, PaginatedResponseDto<LedgerEntryResponseDto>> {
  constructor (private readonly entryRepository: LedgerEntryRepository) {
    super();
  }

  async execute ({ accountId, page = 1, limit = 50, role }: GetAccountEntriesDto): Promise<PaginatedResponseDto<LedgerEntryResponseDto>> {
    const offset = (page - 1) * limit;
    const isAdmin = role && [UserRoles.GLOBAL_ADMIN, UserRoles.ADMIN, UserRoles.MODERATOR].includes(role);

    if (isAdmin) {
      const entries = await this.entryRepository.findAllPaginated(limit, offset);
      const total = await this.entryRepository.countAll();
      return new PaginatedResponseDto(entries, total, page, limit);
    }

    const entries = await this.entryRepository.findByAccountIdPaginated(accountId, limit, offset);
    const total = await this.entryRepository.countByAccountId(accountId);
    return new PaginatedResponseDto(entries, total, page, limit);
  }
}
