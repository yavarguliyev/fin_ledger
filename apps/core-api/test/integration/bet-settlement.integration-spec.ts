import { setTimeout as sleep } from 'node:timers/promises';

import { BETTING_DRAW } from '@common/shared-libs';

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
      DbHelper.query({
        sql: "SELECT count(*)::int AS count FROM outbox_events WHERE aggregate_id = ANY($1) AND event_type = 'bet.settled'",
        params: [placed.map(({ id }) => id)]
      })
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

    let placed: SettledBet | null = null;
    for (let attempt = 0; attempt < maxBets && !placed; attempt++) {
      const bet = await ApiHelper.request<SettledBet>({
        method: 'POST',
        path: '/bets',
        token: player,
        body: { walletId: wallet?.id, eventId: event?.id, selection: 'Home', stakeMinor: 100, idempotencyKey: `settlement-admin-payout-${attempt}` }
      });

      expect(bet).toMatchObject({ status: 201 });
      if (bet.body.status === 'LOST') placed = bet.body;
    }

    if (!placed) throw new Error('No losing bet to re-settle');

    const target = placed;

    await DbHelper.query({
      sql: `UPDATE bets SET status = 'PENDING', payout_minor = NULL, settled_at = NULL, settlement_ledger_transaction_id = NULL,
            draw_value = NULL, draw_threshold = NULL WHERE id = $1`,
      params: [target.id]
    });

    const admin = await ApiHelper.login({ email: 'admin@seed.local' });
    const settle = async (payoutMinor: number): Promise<number> =>
      (
        await ApiHelper.request({
          method: 'POST',
          path: `/bets/${target.id}/settlement`,
          token: admin,
          body: { outcome: { status: 'WON', payoutMinor } }
        })
      ).status;

    await expect(settle(target.potentialPayoutMinor * 1000)).resolves.toBe(400);
    await expect(DbHelper.query({ sql: 'SELECT status, payout_minor FROM bets WHERE id = $1', params: [target.id] })).resolves.toEqual([
      { status: 'PENDING', payout_minor: null }
    ]);

    await expect(settle(target.potentialPayoutMinor)).resolves.toBe(201);
    await expect(DbHelper.query({ sql: 'SELECT draw_value, draw_threshold FROM bets WHERE id = $1', params: [target.id] })).resolves.toEqual([
      { draw_value: null, draw_threshold: null }
    ]);
  }, 60_000);

  it('records the odds-derived draw that decided each settled bet', async () => {
    const [wallet] = await DbHelper.query<{ id: string }>({
      sql: 'SELECT w.id FROM wallets w JOIN users u ON u.id = w.user_id WHERE u.email = $1',
      params: [email]
    });

    const [event] = await DbHelper.query<{ id: string }>({
      sql: "SELECT id FROM game_events WHERE status = 'SCHEDULED' AND betting_closes_at > now() ORDER BY starts_at LIMIT 1"
    });

    const player = await ApiHelper.login({ email });

    const bet = await ApiHelper.request<SettledBet>({
      method: 'POST',
      path: '/bets',
      token: player,
      body: { walletId: wallet?.id, eventId: event?.id, selection: 'Home', stakeMinor: 100, idempotencyKey: 'settlement-draw-audit' }
    });

    expect(bet).toMatchObject({ status: 201 });

    const [row] = await DbHelper.query<{ status: string; draw_value: string; draw_threshold: string; odds_at_placement: string }>({
      sql: 'SELECT status, draw_value, draw_threshold, odds_at_placement FROM bets WHERE id = $1',
      params: [bet.body.id]
    });

    const drawValue = Number(row?.draw_value);
    const drawThreshold = Number(row?.draw_threshold);

    expect(drawValue).toBeGreaterThanOrEqual(0);
    expect(row?.status).toBe(drawValue < drawThreshold ? 'WON' : 'LOST');
    expect(drawThreshold).toBe(Math.floor(BETTING_DRAW.DRAW_RANGE / (Number(row?.odds_at_placement) * (1 + BETTING_DRAW.DEFAULT_MARGIN))));
  }, 60_000);
});
