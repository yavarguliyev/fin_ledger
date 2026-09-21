import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { WalletDto } from '../../../dtos/wallet/wallet.dto';
import { UpdateWalletStatusDto } from '../../../dtos/request/update-wallet-status.dto';
import { DomainEventType, AggregateType, BettingType, WalletStatus } from '@common/libs';
import { WalletBaseUseCase } from '../../base/wallet-base.use-case';

@Injectable()
export class UpdateWalletStatusUseCase extends WalletBaseUseCase<UpdateWalletStatusDto, WalletDto> {
  protected readonly currentDomainEventType: DomainEventType = DomainEventType.NONE;
  protected readonly currentAggregateType: AggregateType = 'None';
  protected readonly currentBettingType: BettingType = 'NONE';
  protected readonly requiredToCheckAmountMinor: boolean = false;

  async execute ({ walletId, status }: UpdateWalletStatusDto): Promise<WalletDto> {
    const wallet = await this.walletRepository.findById({ id: walletId });
    if (!wallet) throw new NotFoundException(`Wallet with ID ${walletId} not found`);

    if (wallet.status === WalletStatus.CLOSED && status !== WalletStatus.CLOSED) throw new ConflictException('A closed wallet cannot be reopened');

    const hasFunds = Number(wallet.availableBalanceMinor) !== 0 || Number(wallet.reservedBalanceMinor) !== 0;
    if (status === WalletStatus.CLOSED && hasFunds) throw new ConflictException('A wallet can only be closed once its balance is zero');

    const updatedWallet = await this.walletRepository.update({ id: walletId, data: { status } });
    if (!updatedWallet) throw new NotFoundException('Failed to update wallet status');

    return updatedWallet;
  }
}
