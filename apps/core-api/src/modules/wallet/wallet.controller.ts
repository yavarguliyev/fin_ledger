import { Body, Controller, Get, Param, Post, Patch, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ENVIRONMENT_CONSTANTS, SessionGuard, RolesGuard, Roles, UserRoles, WalletStatus } from '@common/libs';

import { WalletService } from './wallet.service';
import { CreditDebitDto } from './dtos/balance-operation/credit-debit.dto';
import { PlaceBetDto } from './dtos/betting/place-bet.dto';
import { ReserveReleaseDto } from './dtos/balance-operation/reserve-release.type';
import { SettleWinningsDto } from './dtos/betting/settle-winnings.dto';
import { WalletDto } from './dtos/wallet/wallet.dto';
import { UpdateWalletStatusDto } from './dtos/wallet/update-wallet-status.dto';
import { SHARED_CONSTANTS } from '../../shared/constants/shared.constant';

@ApiTags(SHARED_CONSTANTS.WALLET.key)
@UseGuards(SessionGuard, RolesGuard)
@Roles(UserRoles.USER)
@Controller({ path: ENVIRONMENT_CONSTANTS.RESOURCES.WALLET, version: ENVIRONMENT_CONSTANTS.VERSION.V1 })
export class WalletController {
  constructor (private readonly walletService: WalletService) {}

  @Post(':walletId/bets')
  async placeBet (@Param('walletId') walletId: string, @Body() dto: PlaceBetDto): Promise<WalletDto> {
    return this.walletService.placeBet({ walletId, ...dto });
  }

  @Post(':walletId/winnings')
  async settleWinnings (@Param('walletId') walletId: string, @Body() dto: SettleWinningsDto): Promise<WalletDto> {
    return this.walletService.settleWinnings({ walletId, ...dto });
  }

  @Post(':walletId/credit')
  async creditWallet (@Param('walletId') walletId: string, @Body() dto: CreditDebitDto): Promise<WalletDto> {
    return this.walletService.creditWallet({ walletId, ...dto });
  }

  @Post(':walletId/debit')
  async debitWallet (@Param('walletId') walletId: string, @Body() dto: CreditDebitDto): Promise<WalletDto> {
    return this.walletService.debitWallet({ walletId, ...dto });
  }

  @Post(':walletId/reserve')
  async reserveFunds (@Param('walletId') walletId: string, @Body() dto: ReserveReleaseDto): Promise<WalletDto> {
    return this.walletService.reserveFunds(walletId, dto.amountMinor);
  }

  @Post(':walletId/release')
  async releaseFunds (@Param('walletId') walletId: string, @Body() dto: ReserveReleaseDto): Promise<WalletDto> {
    return this.walletService.releaseFunds(walletId, dto.amountMinor);
  }

  @Roles(UserRoles.GLOBAL_ADMIN, UserRoles.ADMIN, UserRoles.MODERATOR, UserRoles.USER)
  @Get(':walletId')
  async findWalletById (@Param('walletId') walletId: string): Promise<WalletDto | null> {
    return this.walletService.getWallet(walletId);
  }

  @Roles(UserRoles.GLOBAL_ADMIN, UserRoles.ADMIN, UserRoles.MODERATOR)
  @Patch(':walletId/status')
  async updateWalletStatus (@Param('walletId') walletId: string, @Body() dto: UpdateWalletStatusDto): Promise<WalletDto> {
    return this.walletService.updateWalletStatus(walletId, dto.status as WalletStatus);
  }
}
