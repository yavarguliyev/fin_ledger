import { ApiHelper } from '../helpers/api.helper';
import { BET_SETTLEMENT_TEST as B } from '../constants/bet-settlement.constant';
import { BetTestHelper } from '../helpers/bet-test.helper';
import { DbHelper } from '../helpers/db.helper';
import { SettledBet } from '../interfaces/bet-settlement.interface';

const losingBet = async (): Promise<SettledBet> => {
  const seat = await BetTestHelper.seat();
  for (let attempt = 0; attempt < B.MAX_BETS; attempt++) {
    const bet = await BetTestHelper.place({ seat, idempotencyKey: `${B.ADMIN_PAYOUT_KEY}${attempt}` });
    expect(bet).toMatchObject({ status: B.CREATED });
    if (bet.body.status === B.LOST) return bet.body;
  }
  throw new Error(B.NO_LOSING_BET);
};

describe('Admin bet settlement', () => {
  afterAll(async () => DbHelper.close());

  it(
    'refuses an admin settlement that pays a winner more than the potential payout',
    async () => {
      const target = await losingBet();
      await DbHelper.query({ sql: B.REOPEN_SQL, params: [target.id] });
      const admin = await ApiHelper.login({ email: B.ADMIN_EMAIL });
      const settle = async (payoutMinor: number): Promise<number> =>
        (
          await ApiHelper.request({
            method: 'POST',
            path: `${B.BETS_PATH}/${target.id}${B.SETTLEMENT_SUFFIX}`,
            token: admin,
            body: { outcome: { status: B.WON, payoutMinor } }
          })
        ).status;

      await expect(settle(target.potentialPayoutMinor * B.OVERPAY_FACTOR)).resolves.toBe(B.BAD_REQUEST);
      await expect(DbHelper.query({ sql: B.PAYOUT_SQL, params: [target.id] })).resolves.toEqual([{ status: B.PENDING, payout_minor: null }]);

      await expect(settle(target.potentialPayoutMinor)).resolves.toBe(B.CREATED);
      await expect(DbHelper.query({ sql: B.DRAW_SQL, params: [target.id] })).resolves.toEqual([{ draw_value: null, draw_threshold: null }]);
    },
    B.TIMEOUT_MS
  );
});
