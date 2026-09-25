import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';

interface IntegrityReport {
  driftedAccounts: number;
  driftedWallets: number;
  unbalancedCurrencies: string[];
  healthy: boolean;
}

describe('Ledger integrity check', () => {
  const email = 'player19@seed.local';
  let admin: string;

  const report = (): ReturnType<typeof ApiHelper.request<IntegrityReport>> =>
    ApiHelper.request<IntegrityReport>({ method: 'GET', path: '/ledgers/integrity', token: admin });

  const shiftBalance = (delta: number): ReturnType<typeof DbHelper.query> =>
    DbHelper.query({
      sql: 'UPDATE wallets SET available_balance_minor = available_balance_minor + $2 WHERE user_id = (SELECT id FROM users WHERE email = $1)',
      params: [email, delta]
    });

  beforeAll(async () => {
    admin = await ApiHelper.login({ email: 'admin@seed.local' });
  });

  afterAll(async () => DbHelper.close());

  it('reports a clean ledger as healthy', async () => {
    await expect(report()).resolves.toMatchObject({
      status: 200,
      body: { driftedAccounts: 0, driftedWallets: 0, unbalancedCurrencies: [], healthy: true }
    });
  });

  it('detects a wallet balance that no longer matches its ledger account', async () => {
    await shiftBalance(1);

    try {
      await expect(report()).resolves.toMatchObject({ status: 200, body: { driftedWallets: 1, healthy: false } });
    } finally {
      await shiftBalance(-1);
    }

    await expect(report()).resolves.toMatchObject({ body: { healthy: true } });
  });

  it('is only available to admins', async () => {
    const player = await ApiHelper.login({ email });
    await expect(ApiHelper.request({ method: 'GET', path: '/ledgers/integrity', token: player })).resolves.toMatchObject({ status: 403 });
  });
});
