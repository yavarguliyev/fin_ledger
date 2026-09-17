import { Injectable, NotFoundException } from '@nestjs/common';

import { WalletDto, UpdateWalletStatusInput } from '../../../dtos/wallet/wallet.dto';
import { WalletTransactionType, DomainEventType, AggregateType, BettingType } from '@common/libs';
import { WalletBaseUseCase } from '../../base/wallet-base.use-case';

@Injectable()
export class UpdateWalletStatusUseCase extends WalletBaseUseCase<UpdateWalletStatusInput, WalletDto> {
  protected readonly currentWalletTransactionType: WalletTransactionType = WalletTransactionType.NONE;
  protected readonly currentDomainEventType: DomainEventType = DomainEventType.NONE;
  protected readonly currentAggregateType: AggregateType = 'None';
  protected readonly currentBettingType: BettingType = 'NONE';
  protected readonly balanceWalletTransactionType = WalletTransactionType.NONE;
  protected readonly requiredToCheckAmountMinor: boolean = false;

  constructor () {
    super();
  }

  async execute ({ walletId, status }: UpdateWalletStatusInput): Promise<WalletDto> {
    const wallet = await this.walletRepository.findById(walletId);
    if (!wallet) throw new NotFoundException(`Wallet with ID ${walletId} not found`);

    const updatedWallet = await this.walletRepository.update(walletId, { status });
    if (!updatedWallet) throw new NotFoundException('Failed to update wallet status');

    return updatedWallet;
  }
}
