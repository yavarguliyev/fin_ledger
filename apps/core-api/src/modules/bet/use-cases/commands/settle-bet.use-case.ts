import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { DomainEventType, OutboxRepository } from '@common/libs';

import { BetBaseUseCase } from '../base/bet-base.use-case';
import { BetHelper } from '../../helpers/bet.helper';
import { BetDto } from '../../dtos/bet/bet.dto';
import { SettleBetDto } from '../../dtos/request/settle-bet.dto';
import { SettleBetTransactionDto } from '../../dtos/step/settle-bet-transaction.dto';
import { CreditPayoutDto } from '../../dtos/step/credit-payout.dto';
import { BetSettledPayloadDto } from '../../dtos/event/bet-settled-payload.dto';

@Injectable()
export class SettleBetUseCase extends BetBaseUseCase<SettleBetDto, BetDto> {
  @Inject(OutboxRepository)
  private readonly outboxRepository!: OutboxRepository;

  async execute (dto: SettleBetDto): Promise<BetDto> {
    return this.postgresService.getWriteConnection().transaction({ callback: adapter => this.settle({ ...dto, adapter }) });
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

    const payload: BetSettledPayloadDto = {
      betId: settled.id,
      userId: settled.userId,
      walletId: settled.walletId,
      status: settled.status,
      selection: settled.selection,
      payoutMinor: settled.payoutMinor ?? 0,
      currency: settled.currency
    };
    await this.outboxRepository.createEvent({ aggregateType: 'Bet', aggregateId: settled.id, eventType: DomainEventType.BET_SETTLED, payload, adapter });

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
}
