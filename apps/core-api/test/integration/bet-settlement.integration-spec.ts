import { setTimeout as sleep } from 'node:timers/promises';

import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';

interface SettledBet {
  id: string;
  status: string;
  payoutMinor: number;
  potentialPayoutMinor: number;
}

describe('Bet settlement', () => {
  const email = 'player17@seed.local';
  const maxBets = 20;

  afterAll(async () => DbHelper.close());

  it('writes a settlement event for every bet and notifies winners in their currency', async () => {
    const [wallet] = await DbHelper.query<{ id: string; currency: string }>({
      sql: 'SELECT w.id, w.currency FROM wallets w JOIN users u ON u.id = w.user_id WHERE u.email = $1',
      params: [email]
    });
    const [event] = await DbHelper.query<{ id: string }>({
      sql: "SELECT id FROM game_events WHERE status = 'SCHEDULED' AND betting_closes_at > now() ORDER BY starts_at LIMIT 1"
    });
    const player = await ApiHelper.login({ email });

    const placed: SettledBet[] = [];
    while (!placed.some(({ status }) => status === 'WON') && placed.length < maxBets) {
      const bet = await ApiHelper.request<SettledBet>({
        method: 'POST',
        path: '/bets',
        token: player,
        body: { walletId: wallet?.id, eventId: event?.id, selection: 'Home', stakeMinor: 100, idempotencyKey: `settlement-${placed.length}` }
      });
      expect(bet).toMatchObject({ status: 201 });
      placed.push(bet.body);
    }

    await expect(
      DbHelper.query({ sql: "SELECT count(*)::int AS count FROM outbox_events WHERE aggregate_id = ANY($1) AND event_type = 'bet.settled'", params: [placed.map(({ id }) => id)] })
    ).resolves.toEqual([{ count: placed.length }]);

    const won = placed.find(({ status }) => status === 'WON') as SettledBet;
    const winNotifications = async (): Promise<Array<{ content: string }>> =>
      DbHelper.query<{ content: string }>({
        sql: "SELECT n.content FROM notifications n JOIN users u ON u.id = n.user_id WHERE u.email = $1 AND n.type = 'BET_WON'",
        params: [email]
      });

    const deadline = Date.now() + 20_000;
    while ((await winNotifications()).length === 0 && Date.now() < deadline) await sleep(500);

    const digits = new Intl.NumberFormat('en', { style: 'currency', currency: wallet?.currency }).resolvedOptions().maximumFractionDigits ?? 2;
    await expect(winNotifications()).resolves.toEqual([
      { content: `Congratulations! You won ${(won.payoutMinor / 10 ** digits).toFixed(digits)} ${wallet?.currency} on Home.` }
    ]);
  }, 60_000);

  it('refuses an admin settlement that pays a winner more than the potential payout', async () => {
    const [wallet] = await DbHelper.query<{ id: string }>({
      sql: 'SELECT w.id FROM wallets w JOIN users u ON u.id = w.user_id WHERE u.email = $1',
      params: [email]
    });
    const [event] = await DbHelper.query<{ id: string }>({
      sql: "SELECT id FROM game_events WHERE status = 'SCHEDULED' AND betting_closes_at > now() ORDER BY starts_at LIMIT 1"
    });
    const player = await ApiHelper.login({ email });

    const placed = await ApiHelper.request<SettledBet>({
      method: 'POST',
      path: '/bets',
      token: player,
      body: { walletId: wallet?.id, eventId: event?.id, selection: 'Home', stakeMinor: 100, idempotencyKey: 'settlement-admin-payout' }
    });
    expect(placed).toMatchObject({ status: 201 });

    await DbHelper.query({
      sql: "UPDATE bets SET status = 'PENDING', payout_minor = NULL, settled_at = NULL, settlement_ledger_transaction_id = NULL WHERE id = $1",
      params: [placed.body.id]
    });

    const admin = await ApiHelper.login({ email: 'admin@seed.local' });
    const settle = async (payoutMinor: number): Promise<number> =>
      (
        await ApiHelper.request({
          method: 'POST',
          path: `/bets/${placed.body.id}/settlement`,
          token: admin,
          body: { outcome: { status: 'WON', payoutMinor } }
        })
      ).status;

    await expect(settle(placed.body.potentialPayoutMinor * 1000)).resolves.toBe(400);
    await expect(
      DbHelper.query({ sql: 'SELECT status, payout_minor FROM bets WHERE id = $1', params: [placed.body.id] })
    ).resolves.toEqual([{ status: 'PENDING', payout_minor: null }]);

    await expect(settle(placed.body.potentialPayoutMinor)).resolves.toBe(201);
  }, 60_000);
});
