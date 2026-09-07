import { Body, Controller, Get, Param, Post, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ENVIRONMENT_CONSTANTS, PaginatedResponseDto, AccountType, SessionGuard, RequestContext } from '@common/libs';

import { LedgerService } from './ledger.service';
import { CreateLedgerAccountDto } from './dtos/account/create-account.dto';
import { CreateLedgerTransactionDto } from './dtos/transaction/create-transaction.dto';
import { LedgerEntryResponseDto } from './dtos/entry/ledger-entry-response.dto';
import { LedgerAccountDto } from './dtos/account/ledger-account.dto';
import { SHARED_CONSTANTS } from '../../shared/constants/shared.constant';

@ApiTags(SHARED_CONSTANTS.LEDGER.key)
@UseGuards(SessionGuard)
@Controller({ path: ENVIRONMENT_CONSTANTS.RESOURCES.LEDGER, version: ENVIRONMENT_CONSTANTS.VERSION.V1 })
export class LedgerController {
  constructor (private readonly ledgerService: LedgerService) {}

  @Post('accounts')
  async createAccount (@Body() dto: CreateLedgerAccountDto): Promise<LedgerAccountDto> {
    return this.ledgerService.createAccount(dto.userId, dto.accountType as AccountType, dto.currency);
  }

  @Post('transactions')
  async createTransaction (@Body() dto: CreateLedgerTransactionDto): Promise<LedgerEntryResponseDto[]> {
    return this.ledgerService.createTransaction(dto.entries);
  }

  @Get('accounts/:id')
  async getAccount (@Param('id') id: string): Promise<LedgerAccountDto | null> {
    return this.ledgerService.getAccount(id);
  }

  @Get('transactions/:id/entries')
  async getTransactionEntries (@Param('id') id: string): Promise<LedgerEntryResponseDto[]> {
    return this.ledgerService.getTransactionEntries(id);
  }

  @Get('accounts/:id/entries')
  async getAccountEntries (
    @Req() req: RequestContext,
    @Param('id') id: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '25'
  ): Promise<PaginatedResponseDto<LedgerEntryResponseDto>> {
    return this.ledgerService.getAccountEntries(id, parseInt(page, 10), parseInt(limit, 10), req.user.role);
  }
}
