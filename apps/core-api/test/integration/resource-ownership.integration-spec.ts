import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';

const tokens: Record<'owner' | 'other' | 'staff', string> = { owner: '', other: '', staff: '' };

const ids = { payment: '', account: '', transaction: '', systemAccount: '' };

beforeAll(async () => {
  [tokens.owner, tokens.other, tokens.staff] = await Promise.all([
    ApiHelper.login({ email: 'player1@realtime-wallet-payments.com' }),
    ApiHelper.login({ email: 'player2@realtime-wallet-payments.com' }),
    ApiHelper.login({ email: 'admin@realtime-wallet-payments.com' })
  ]);

  const [payment] = await DbHelper.query<{ id: string }>({
    sql: `INSERT INTO payments (idempotency_key, user_id, wallet_id, currency, type, status, amount_minor, provider)
          SELECT 'ownership-spec', u.id, w.id, w.currency, 'DEPOSIT', 'PENDING', 1234, 'stripe'
          FROM users u JOIN wallets w ON w.user_id = u.id WHERE u.email = 'player1@realtime-wallet-payments.com' RETURNING id`
  });

  const [account] = await DbHelper.query<{ id: string }>({
    sql: "SELECT la.id FROM ledger_accounts la JOIN users u ON u.id = la.user_id WHERE u.email = 'player1@realtime-wallet-payments.com'"
  });

  const [entry] = await DbHelper.query<{ transaction_id: string }>({
    sql: 'SELECT transaction_id FROM ledger_entries WHERE account_id = $1 LIMIT 1',
    params: [account?.id]
  });

  const [systemAccount] = await DbHelper.query<{ id: string }>({ sql: "SELECT id FROM ledger_accounts WHERE owner_type = 'SYSTEM' LIMIT 1" });
  Object.assign(ids, { payment: payment?.id, account: account?.id, transaction: entry?.transaction_id, systemAccount: systemAccount?.id });
});

afterAll(async () => DbHelper.close());

const routes = (): Record<string, string> => ({
  payment: `/payments/${ids.payment}`,
  ledgerAccount: `/ledgers/accounts/${ids.account}`,
  accountEntries: `/ledgers/accounts/${ids.account}/entries?page=1&limit=5`,
  transactionEntries: `/ledgers/transactions/${ids.transaction}/entries`
});

describe('Resource ownership (payments and ledger)', () => {
  it.each(['payment', 'ledgerAccount', 'accountEntries', 'transactionEntries'])('%s: owner 200, other user 404, staff 200', async route => {
    const path = routes()[route] as string;

    await expect(ApiHelper.request({ path, token: tokens.owner })).resolves.toMatchObject({ status: 200 });
    await expect(ApiHelper.request({ path, token: tokens.other })).resolves.toMatchObject({ status: 404 });
    await expect(ApiHelper.request({ path, token: tokens.staff })).resolves.toMatchObject({ status: 200 });
  });

  it('keeps the staff-only views away from users', async () => {
    const allEntries = '/ledgers/accounts/all/entries?page=1&limit=5';
    const systemAccount = `/ledgers/accounts/${ids.systemAccount}`;

    await expect(ApiHelper.request({ path: allEntries, token: tokens.owner })).resolves.toMatchObject({ status: 404 });
    await expect(ApiHelper.request({ path: allEntries, token: tokens.staff })).resolves.toMatchObject({ status: 200 });
    await expect(ApiHelper.request({ path: systemAccount, token: tokens.owner })).resolves.toMatchObject({ status: 404 });
  });

  it('answers a malformed ID with 404 for users', async () => {
    await expect(ApiHelper.request({ path: '/payments/not-a-uuid', token: tokens.owner })).resolves.toMatchObject({ status: 404 });
  });
});
