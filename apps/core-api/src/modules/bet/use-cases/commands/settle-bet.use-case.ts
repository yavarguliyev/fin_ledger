import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { BetStatus, NotificationStatus, NotificationType } from '@common/libs';

import { BetBaseUseCase } from '../base/bet-base.use-case';
import { BetHelper } from '../../helpers/bet.helper';
import { BetDto } from '../../dtos/bet/bet.dto';
import { SettleBetDto } from '../../dtos/request/settle-bet.dto';
import { SettleBetTransactionDto } from '../../dtos/step/settle-bet-transaction.dto';
import { CreditPayoutDto } from '../../dtos/step/credit-payout.dto';
import { NotificationService } from '../../../notification/notification.service';

@Injectable()
export class SettleBetUseCase extends BetBaseUseCase<SettleBetDto, BetDto> {
  private readonly logger = new Logger(SettleBetUseCase.name);

  constructor (private readonly notificationService: NotificationService) {
    super();
  }

  async execute (dto: SettleBetDto): Promise<BetDto> {
    const settled = await this.postgresService.getWriteConnection().transaction({ callback: adapter => this.settle({ ...dto, adapter }) });

    void this.notifySettlement(settled);
    return settled;
  }

  private async settle (dto: SettleBetTransactionDto): Promise<BetDto> {
    const { betId, outcome, adapter } = dto;

    const bet = BetHelper.assertSettleable(await this.betRepository.findByIdForUpdate({ id: betId, adapter }));
    const result = BetHelper.assertOutcomeMatchesStake({ outcome: outcome ?? BetHelper.resolveOutcome(bet), bet });
    const settlementLedgerTransactionId =
      result.payoutMinor > 0 ? await this.creditPayout({ bet, payoutMinor: result.payoutMinor, adapter }) : undefined;

    const settled = await this.betRepository.settle({
      betId: bet.id,
      status: result.status,
      payoutMinor: result.payoutMinor,
      settledAt: new Date().toISOString(),
      ...(settlementLedgerTransactionId && { settlementLedgerTransactionId }),
      adapter
    });

    if (!settled) throw new InternalServerErrorException('Failed to settle bet');
    return settled;
  }

  private async creditPayout (dto: CreditPayoutDto): Promise<string> {
    const { bet, payoutMinor, adapter } = dto;

    const { ledgerTransactionId } = await this.walletService.settleWinnings({
      walletId: bet.walletId,
      amountMinor: payoutMinor,
      currency: bet.currency,
      transactionId: `bet-settlement:${bet.id}`,
      reference: `Bet settlement ${bet.id}`,
      adapter
    });

    return ledgerTransactionId;
  }

  private async notifySettlement (bet: BetDto): Promise<void> {
    if (bet.status !== BetStatus.WON) return;

    try {
      await this.notificationService.createNotification({
        userId: bet.userId,
        title: 'Bet Won! 🎉',
        content: `Congratulations! You won ${(Number(bet.payoutMinor) / 100).toFixed(2)} ${bet.currency} on ${bet.selection}.`,
        type: NotificationType.WALLET_CREDITED,
        status: NotificationStatus.SENT
      });
    } catch (error) {
      this.logger.warn(`Bet settlement notification skipped: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
