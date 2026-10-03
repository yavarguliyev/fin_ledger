import { setTimeout as sleep } from 'node:timers/promises';
import { BETTING_DRAW } from '@common/shared-libs';

import { BET_SETTLEMENT_TEST as B } from '../constants/bet-settlement.constant';
import { BetTestHelper } from '../helpers/bet-test.helper';
import { ContentRow, DrawAuditRow, SettledBet } from '../interfaces/bet-settlement.interface';
import { DbHelper } from '../helpers/db.helper';

const winNotifications = (): Promise<ContentRow[]> => DbHelper.query<ContentRow>({ sql: B.WIN_NOTIFICATIONS_SQL, params: [B.EMAIL] });

describe('Bet settlement', () => {
  afterAll(async () => DbHelper.close());

  it(
    'writes a settlement event for every bet and notifies winners in their currency',
    async () => {
      const seat = await BetTestHelper.seat();
      const placed: SettledBet[] = [];
      while (!placed.some(({ status }) => status === B.WON) && placed.length < B.MAX_BETS) {
        const bet = await BetTestHelper.place({ seat, idempotencyKey: `${B.SETTLEMENT_KEY}${placed.length}` });
        expect(bet).toMatchObject({ status: B.CREATED });
        placed.push(bet.body);
      }

      await expect(DbHelper.query({ sql: B.SETTLED_EVENTS_SQL, params: [placed.map(({ id }) => id)] })).resolves.toEqual([{ count: placed.length }]);

      const won = placed.find(({ status }) => status === B.WON) as SettledBet;
      const digits =
        new Intl.NumberFormat(B.LOCALE, { style: B.CURRENCY_STYLE, currency: seat.currency }).resolvedOptions().maximumFractionDigits ??
        B.DEFAULT_DIGITS;
      const expected = {
        content: `Congratulations! You won ${(won.payoutMinor / B.BASE ** digits).toFixed(digits)} ${seat.currency} on ${B.SELECTION}.`
      };
      const deadline = Date.now() + B.NOTIFY_WAIT_MS;
      while (!(await winNotifications()).some(row => row.content === expected.content) && Date.now() < deadline) await sleep(B.NOTIFY_POLL_MS);

      await expect(winNotifications()).resolves.toContainEqual(expected);
    },
    B.TIMEOUT_MS
  );

  it(
    'records the odds-derived draw that decided each settled bet',
    async () => {
      const bet = await BetTestHelper.place({ seat: await BetTestHelper.seat(), idempotencyKey: B.DRAW_AUDIT_KEY });
      expect(bet).toMatchObject({ status: B.CREATED });

      const [row] = await DbHelper.query<DrawAuditRow>({ sql: B.DRAW_AUDIT_SQL, params: [bet.body.id] });
      const drawValue = Number(row?.draw_value);
      const drawThreshold = Number(row?.draw_threshold);

      expect(drawValue).toBeGreaterThanOrEqual(0);
      expect(row?.status).toBe(drawValue < drawThreshold ? B.WON : B.LOST);
      expect(drawThreshold).toBe(Math.floor(BETTING_DRAW.DRAW_RANGE / (Number(row?.odds_at_placement) * (1 + BETTING_DRAW.DEFAULT_MARGIN))));
    },
    B.TIMEOUT_MS
  );
});
