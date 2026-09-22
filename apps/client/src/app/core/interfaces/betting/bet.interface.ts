import { BetStatus } from '../../types/betting/bet-status.type';
import { CreatedAt } from '../base/created-at.interface';
import { Currency } from '../base/currency.interface';
import { Id } from '../base/id.interface';
import { UpdatedAt } from '../base/updated-at.interface';
import { UserId } from '../base/user-id.interface';

export interface Bet extends Id, CreatedAt, UpdatedAt, Currency, UserId {
  walletId: string;
  eventId: string;
  selection: string;
  stakeMinor: number;
  oddsAtPlacement: string;
  potentialPayoutMinor: number;
  status: BetStatus;
  payoutMinor: number | null;
  placedAt: string;
  settledAt: string | null;
}
