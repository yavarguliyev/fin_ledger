import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  ENVIRONMENT_CONSTANTS,
  PaginatedResponseDto,
  ParamsQueryAndHeaders,
  SessionGuard,
  RequestContext,
  UserRoles,
  RolesGuard,
  Roles
} from '@common/libs';

import { SHARED_CONSTANTS } from '../../shared/constants/shared.constant';
import { WalletTransactionRecordDto } from './dtos/transaction/wallet-transaction-record.dto';
import { WalletTransactionSummaryDto } from './dtos/summary/wallet-transaction-summary.dto';
import { WalletTransactionService } from './wallet-transaction.service';
import { ListWalletTransactionsRequestDto, ListWalletTransactionsRequestSchema } from './dtos/request/list-wallet-transactions-request.dto';
import { GetWalletSummaryRequestDto, GetWalletSummaryRequestSchema } from './dtos/request/get-wallet-summary-request.dto';
import { WalletAccessGuard } from '../wallet/guards/wallet-access.guard';

@ApiTags(SHARED_CONSTANTS.WALLET_TRANSACTION.key)
@UseGuards(SessionGuard, RolesGuard, WalletAccessGuard)
@Roles({ roles: [UserRoles.USER, UserRoles.MODERATOR, UserRoles.ADMIN, UserRoles.GLOBAL_ADMIN] })
@Controller({ path: ENVIRONMENT_CONSTANTS.RESOURCES.WALLET_TRANSACTION, version: ENVIRONMENT_CONSTANTS.VERSION.V1 })
export class WalletTransactionController {
  constructor (private readonly walletTransactionService: WalletTransactionService) {}

  @Get(':walletId/transactions')
  async findWalletTransactions (
    @Req() req: RequestContext,
    @ParamsQueryAndHeaders({ schema: ListWalletTransactionsRequestSchema }) dto: ListWalletTransactionsRequestDto
  ): Promise<PaginatedResponseDto<WalletTransactionRecordDto>> {
    return this.walletTransactionService.getWalletTransactions({ ...dto, role: req.user.role });
  }

  @Get(':walletId/bets')
  async findWalletBets (
    @Req() req: RequestContext,
    @ParamsQueryAndHeaders({ schema: ListWalletTransactionsRequestSchema }) dto: ListWalletTransactionsRequestDto
  ): Promise<PaginatedResponseDto<WalletTransactionRecordDto>> {
    return this.walletTransactionService.getWalletBets({ ...dto, role: req.user.role });
  }

  @Get(':walletId/summary')
  async findWalletSummary (
    @Req() req: RequestContext,
    @ParamsQueryAndHeaders({ schema: GetWalletSummaryRequestSchema }) dto: GetWalletSummaryRequestDto
  ): Promise<WalletTransactionSummaryDto[]> {
    return this.walletTransactionService.getWalletTransactionSummary({ ...dto, role: req.user.role });
  }
}
