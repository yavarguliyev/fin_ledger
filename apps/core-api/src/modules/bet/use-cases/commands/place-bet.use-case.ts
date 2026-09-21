import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { BetBaseUseCase } from '../base/bet-base.use-case';
import { SettleBetUseCase } from './settle-bet.use-case';
import { BetHelper } from '../../helpers/bet.helper';
import { BetDto } from '../../dtos/bet/bet.dto';
import { PlaceBetDto } from '../../dtos/input/place-bet.dto';
import { PlaceBetTransactionDto } from '../../dtos/step/place-bet-transaction.dto';

@Injectable()
export class PlaceBetUseCase extends BetBaseUseCase<PlaceBetDto, BetDto> {
  constructor (private readonly settleBetUseCase: SettleBetUseCase) {
    super();
  }

  async execute (dto: PlaceBetDto): Promise<BetDto> {
    const existing = await this.betRepository.findByUserAndIdempotencyKey({ userId: dto.userId, idempotencyKey: dto.idempotencyKey });
    if (existing) return existing;

    const placed = await this.postgresService.getWriteConnection().transaction({ callback: adapter => this.place({ ...dto, adapter }) });

    return this.settleBetUseCase.execute({ betId: placed.id });
  }

  private async place (dto: PlaceBetTransactionDto): Promise<BetDto> {
    const { userId, walletId, eventId, selection, stakeMinor, idempotencyKey, adapter } = dto;

    const event = BetHelper.assertEventAcceptsBets(await this.gameEventRepository.findById({ id: eventId, adapter }));
    const wallet = BetHelper.assertOwnedWallet({ wallet: await this.walletService.getWallet({ walletId }), userId });
    const potentialPayoutMinor = BetHelper.potentialPayout({ stakeMinor, odds: event.odds });

    const { ledgerTransactionId } = await this.walletService.placeBet({
      walletId: wallet.id,
      amountMinor: stakeMinor,
      currency: wallet.currency,
      transactionId: `bet:${idempotencyKey}`,
      reference: `Bet on ${event.label}`,
      adapter
    });

    const bet = await this.betRepository.createBet({
      userId,
      walletId: wallet.id,
      eventId,
      currency: wallet.currency,
      selection,
      stakeMinor,
      oddsAtPlacement: event.odds,
      potentialPayoutMinor,
      idempotencyKey,
      stakeLedgerTransactionId: ledgerTransactionId,
      adapter
    });

    if (!bet) throw new InternalServerErrorException('Failed to record bet');
    return bet;
  }
}
