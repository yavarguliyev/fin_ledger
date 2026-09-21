import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { BetStatus, GameEventStatus, WIN_CHANCE } from '@common/libs';

import { GameEventDto } from '../../game-events/dtos/game-event/game-event.dto';
import { WalletDto } from '../../wallet/dtos/wallet/wallet.dto';
import { BetDto } from '../dtos/bet/bet.dto';
import { BetOutcomeDto } from '../dtos/bet/bet-outcome.dto';
import { AssertOwnedWalletDto } from '../dtos/helper/assert-owned-wallet.dto';
import { PotentialPayoutDto } from '../dtos/helper/potential-payout.dto';
import { AssertOutcomeDto } from '../dtos/helper/assert-outcome.dto';

export class BetHelper {
  private static OPEN_STATUSES: GameEventStatus[] = [GameEventStatus.SCHEDULED, GameEventStatus.LIVE];

  static assertEventAcceptsBets (event: GameEventDto | null): GameEventDto {
    if (!event) throw new NotFoundException('Game event not found');
    if (!this.OPEN_STATUSES.includes(event.status)) throw new ConflictException(`Betting is closed for this event (${event.status})`);

    const closesAt = event.bettingClosesAt ? Date.parse(event.bettingClosesAt) : null;
    if (closesAt !== null && closesAt <= Date.now()) throw new ConflictException('Betting has closed for this event');

    return event;
  }

  static assertOwnedWallet (params: AssertOwnedWalletDto): WalletDto {
    const { wallet, userId } = params;

    if (!wallet) throw new NotFoundException('Wallet not found');
    if (wallet.userId !== userId) throw new ForbiddenException('Wallet does not belong to the current user');

    return wallet;
  }

  static potentialPayout (params: PotentialPayoutDto): number {
    const { stakeMinor, odds } = params;
    const numericOdds = Number(odds);
    if (!Number.isFinite(numericOdds) || numericOdds <= 1) throw new BadRequestException('Event odds are invalid');

    const payout = Math.round(stakeMinor * numericOdds);
    if (!Number.isSafeInteger(payout)) throw new BadRequestException('Stake is too large for the event odds');

    return payout;
  }

  static resolveOutcome (bet: BetDto): BetOutcomeDto {
    if (Math.random() < WIN_CHANCE) return { status: BetStatus.WON, payoutMinor: Number(bet.potentialPayoutMinor) };

    return { status: BetStatus.LOST, payoutMinor: 0 };
  }

  static assertSettleable (bet: BetDto | null): BetDto {
    if (!bet) throw new NotFoundException('Bet not found');
    if (bet.status !== BetStatus.PENDING) throw new ConflictException(`Bet is already settled (${bet.status})`);

    return bet;
  }

  static assertOutcomeMatchesStake (params: AssertOutcomeDto): BetOutcomeDto {
    const { outcome, bet } = params;

    if (outcome.status === BetStatus.PENDING) throw new BadRequestException('Settlement outcome cannot be PENDING');
    if (outcome.status === BetStatus.LOST && outcome.payoutMinor !== 0) throw new BadRequestException('A lost bet pays nothing');
    if (outcome.status === BetStatus.VOIDED && outcome.payoutMinor !== Number(bet.stakeMinor)) {
      throw new BadRequestException('A voided bet refunds exactly the stake');
    }

    return outcome;
  }
}
