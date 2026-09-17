import { Injectable } from '@nestjs/common';
import {
  DomainEventType,
  BettingType,
  AggregateType,
  WalletTransactionType,
  NotificationType,
  NotificationStatus,
  WIN_CHANCE,
  WIN_PAYOUT_MULTIPLIER
} from '@common/libs';

import { WalletBaseUseCase } from '../../base/wallet-base.use-case';
import { SettleWinningsUseCase } from './settle-winnings.use-case';
import { PlaceBetInput } from '../../../dtos/betting/place-bet.dto';
import { WalletDto } from '../../../dtos/wallet/wallet.dto';
import { NotificationService } from '../../../../notification/notification.service';

@Injectable()
export class PlaceBetUseCase extends WalletBaseUseCase<PlaceBetInput, WalletDto> {
  protected readonly currentWalletTransactionType: WalletTransactionType = WalletTransactionType.BET;
  protected readonly currentDomainEventType: DomainEventType = DomainEventType.WALLET_DEBITED;
  protected readonly currentAggregateType: AggregateType = 'Wallet';
  protected readonly currentBettingType: BettingType = 'BET';
  protected readonly balanceWalletTransactionType = WalletTransactionType.DEBIT;
  protected readonly requiredToCheckAmountMinor: boolean = true;

  constructor (
    private readonly settleWinningsUseCase: SettleWinningsUseCase,
    private readonly notificationService: NotificationService
  ) {
    super();
  }

  override async execute (dto: PlaceBetInput): Promise<WalletDto> {
    const updatedWallet = await super.processWallet(dto);

    if (Math.random() < WIN_CHANCE) {
      const winAmountMinor = Math.round(dto.amountMinor * WIN_PAYOUT_MULTIPLIER);

      const winningWallet = await this.settleWinningsUseCase.execute({
        walletId: dto.walletId,
        amountMinor: winAmountMinor,
        currency: dto.currency,
        transactionId: `${dto.transactionId}-win`,
        reference: `Win: ${dto.reference ?? 'Sports Bet'}`
      });

      void this.notificationService.createNotification({
        userId: updatedWallet.userId,
        title: 'Bet Won! 🎉',
        content: `Congratulations! You won ${(winAmountMinor / 100).toFixed(2)} ${dto.currency} on ${dto.reference ?? 'your bet'}.`,
        type: NotificationType.WALLET_CREDITED,
        status: NotificationStatus.SENT
      });

      return winningWallet;
    }

    return updatedWallet;
  }
}
