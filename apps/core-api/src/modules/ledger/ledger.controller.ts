import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ENVIRONMENT_CONSTANTS, PaginatedResponseDto, SessionGuard, RequestContext, ParamsQueryAndHeaders, Roles, RolesGuard, UserRoles } from '@common/libs';

import { LedgerService } from './ledger.service';
import { LedgerAccountDto } from './dtos/account/ledger-account.dto';
import { LedgerEntryResponseDto } from './dtos/entry/ledger-entry-response.dto';
import { GetLedgerAccountDto, GetLedgerAccountSchema } from './dtos/request/get-ledger-account.dto';
import { GetTransactionEntriesDto, GetTransactionEntriesSchema } from './dtos/request/get-transaction-entries.dto';
import { ListAccountEntriesRequestDto, ListAccountEntriesRequestSchema } from './dtos/request/list-account-entries-request.dto';
import { LedgerAccountAccessGuard } from './guards/ledger-account-access.guard';
import { LedgerTransactionAccessGuard } from './guards/ledger-transaction-access.guard';
import { SHARED_CONSTANTS } from '../../shared/constants/modules/shared.constant';
import { LedgerIntegrityJob } from './jobs/ledger-integrity.job';
import { LedgerIntegrityReportDto } from './dtos/integrity/ledger-integrity-report.dto';

@ApiTags(SHARED_CONSTANTS.LEDGER.key)
@UseGuards(SessionGuard)
@Controller({ path: ENVIRONMENT_CONSTANTS.RESOURCES.LEDGER, version: ENVIRONMENT_CONSTANTS.VERSION.V1 })
export class LedgerController {
  constructor (
    private readonly ledgerService: LedgerService,
    private readonly ledgerIntegrityJob: LedgerIntegrityJob
  ) {}

  @Get('integrity')
  @UseGuards(RolesGuard)
  @Roles({ roles: [UserRoles.GLOBAL_ADMIN, UserRoles.ADMIN] })
  async getIntegrity (): Promise<LedgerIntegrityReportDto> {
    return this.ledgerIntegrityJob.check();
  }

  @Get('accounts/:id')
  @UseGuards(LedgerAccountAccessGuard)
  async getAccount (@ParamsQueryAndHeaders({ schema: GetLedgerAccountSchema }) dto: GetLedgerAccountDto): Promise<LedgerAccountDto | null> {
    return this.ledgerService.getAccount(dto);
  }

  @Get('transactions/:id/entries')
  @UseGuards(LedgerTransactionAccessGuard)
  async getTransactionEntries (@ParamsQueryAndHeaders({ schema: GetTransactionEntriesSchema }) dto: GetTransactionEntriesDto): Promise<LedgerEntryResponseDto[]> {
    return this.ledgerService.getTransactionEntries(dto);
  }

  @Get('accounts/:id/entries')
  @UseGuards(LedgerAccountAccessGuard)
  async getAccountEntries (
    @Req() req: RequestContext,
    @ParamsQueryAndHeaders({ schema: ListAccountEntriesRequestSchema }) dto: ListAccountEntriesRequestDto
  ): Promise<PaginatedResponseDto<LedgerEntryResponseDto>> {
    return this.ledgerService.getAccountEntries({ ...dto, role: req.user.role });
  }
}
