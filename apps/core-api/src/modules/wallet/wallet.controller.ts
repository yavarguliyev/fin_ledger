import { Body, Controller, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Audited, ENVIRONMENT_CONSTANTS, ParamsQueryAndHeaders, RequestContext, SessionGuard, RolesGuard, Roles, UserRoles } from '@common/libs';

import { WalletService } from './wallet.service';
import { WalletDto } from './dtos/wallet/wallet.dto';
import { OpenWalletRequestDto, OpenWalletRequestSchema } from './dtos/request/open-wallet-request.dto';
import { WalletIdRequestDto, WalletIdRequestSchema } from './dtos/request/wallet-id-request.dto';
import { UpdateWalletStatusDto, UpdateWalletStatusSchema } from './dtos/request/update-wallet-status.dto';
import { WalletAccessGuard } from './guards/wallet-access.guard';
import { SHARED_CONSTANTS } from '../../shared/constants/shared.constant';

@ApiTags(SHARED_CONSTANTS.WALLET.key)
@UseGuards(SessionGuard, RolesGuard)
@Roles({ roles: [UserRoles.USER] })
@Controller({ path: ENVIRONMENT_CONSTANTS.RESOURCES.WALLET, version: ENVIRONMENT_CONSTANTS.VERSION.V1 })
export class WalletController {
  constructor (private readonly walletService: WalletService) {}

  @Get()
  async findMyWallets (@Req() req: RequestContext): Promise<WalletDto[]> {
    return this.walletService.getUserWallets({ userId: req.user.userId });
  }

  @Get('currencies')
  async findOpenableCurrencies (@Req() req: RequestContext): Promise<string[]> {
    return this.walletService.getOpenableCurrencies({ userId: req.user.userId });
  }

  @Post()
  async openWallet (@Req() req: RequestContext, @Body({ schema: OpenWalletRequestSchema }) dto: OpenWalletRequestDto): Promise<WalletDto> {
    return this.walletService.openWallet({ ...dto, userId: req.user.userId });
  }

  @Roles({ roles: [UserRoles.GLOBAL_ADMIN, UserRoles.ADMIN, UserRoles.MODERATOR, UserRoles.USER] })
  @UseGuards(WalletAccessGuard)
  @Get(':walletId')
  async findWalletById (@ParamsQueryAndHeaders({ schema: WalletIdRequestSchema }) dto: WalletIdRequestDto): Promise<WalletDto | null> {
    return this.walletService.getWallet(dto);
  }

  @Roles({ roles: [UserRoles.GLOBAL_ADMIN, UserRoles.ADMIN, UserRoles.MODERATOR] })
  @Audited({ action: 'WALLET_STATUS_CHANGED', entityType: 'Wallet', entityIdParam: 'walletId' })
  @Patch(':walletId/status')
  async updateWalletStatus (@ParamsQueryAndHeaders({ schema: UpdateWalletStatusSchema }) dto: UpdateWalletStatusDto): Promise<WalletDto> {
    return this.walletService.updateWalletStatus(dto);
  }
}
