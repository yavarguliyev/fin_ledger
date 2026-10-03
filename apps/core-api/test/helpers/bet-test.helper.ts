import { ApiHelper } from './api.helper';
import { DbHelper } from './db.helper';
import { BET_SETTLEMENT_TEST as B } from '../constants/bet-settlement.constant';
import { ApiResponse } from '../interfaces/api-response.interface';
import { BettingSeat, EventRow, PlaceBet, SettledBet, WalletRow } from '../interfaces/bet-settlement.interface';

export class BetTestHelper {
  static async seat (): Promise<BettingSeat> {
    const [wallet] = await DbHelper.query<WalletRow>({ sql: B.WALLET_SQL, params: [B.EMAIL] });
    const [event] = await DbHelper.query<EventRow>({ sql: B.EVENT_SQL });
    const token = await ApiHelper.login({ email: B.EMAIL });
    return { token, walletId: wallet?.id ?? '', currency: wallet?.currency ?? '', eventId: event?.id ?? '' };
  }

  static place ({ seat, idempotencyKey }: PlaceBet): Promise<ApiResponse<SettledBet>> {
    return ApiHelper.request<SettledBet>({
      method: 'POST',
      path: B.BETS_PATH,
      token: seat.token,
      body: { walletId: seat.walletId, eventId: seat.eventId, selection: B.SELECTION, stakeMinor: B.STAKE_MINOR, idempotencyKey }
    });
  }
}
