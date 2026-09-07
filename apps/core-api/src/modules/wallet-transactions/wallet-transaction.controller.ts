import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ENVIRONMENT_CONSTANTS, PaginatedResponseDto, ParamsAndQuery, SessionGuard, RequestContext, UserRoles } from '@common/libs';

import { SHARED_CONSTANTS } from '../../shared/constants/shared.constant';
import { WalletTransactionRecordDto } from './dtos/transaction/wallet-transaction-record.dto';
import { WalletTransactionSummaryDto } from './dtos/summary/wallet-transaction-summary.dto';
import { WalletTransactionService } from './wallet-transaction.service';
import { WalletPaginatedRequestDto } from './dtos/common/wallet-transaction-paginated-request.dto';

@ApiTags(SHARED_CONSTANTS.WALLET_TRANSACTION.key)
@UseGuards(SessionGuard)
@Controller({ path: ENVIRONMENT_CONSTANTS.RESOURCES.WALLET_TRANSACTION, version: ENVIRONMENT_CONSTANTS.VERSION.V1 })
export class WalletTransactionController {
  constructor (private readonly walletTransactionService: WalletTransactionService) {}

  @Get(':walletId/transactions')
  async findWalletTransactions (@Req() req: RequestContext, @ParamsAndQuery() query: WalletPaginatedRequestDto): Promise<PaginatedResponseDto<WalletTransactionRecordDto>> {
    return this.walletTransactionService.getWalletTransactions(query, req.user.role as UserRoles);
  }

  @Get(':walletId/bets')
  async findWalletBets (@Req() req: RequestContext, @ParamsAndQuery() query: WalletPaginatedRequestDto): Promise<PaginatedResponseDto<WalletTransactionRecordDto>> {
    return this.walletTransactionService.getWalletBets(query, req.user.role as UserRoles);
  }

  @Get(':walletId/summary')
  async findWalletSummary (@Req() req: RequestContext, @Param('walletId') walletId: string): Promise<WalletTransactionSummaryDto> {
    return this.walletTransactionService.getWalletTransactionSummary(walletId, req.user.role as UserRoles);
  }
}
