import { RESOURCE_OWNERSHIP } from '../constants/resource-ownership.constant';
import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { OwnershipEntryRow, OwnershipIdRow, OwnershipIds, OwnershipTokens } from '../interfaces/resource-ownership.interface';

const tokens: OwnershipTokens = { owner: '', other: '', staff: '' };

const ids: OwnershipIds = { payment: '', account: '', transaction: '', systemAccount: '' };

beforeAll(async () => {
  [tokens.owner, tokens.other, tokens.staff] = await Promise.all([
    ApiHelper.login({ email: RESOURCE_OWNERSHIP.OWNER_EMAIL }),
    ApiHelper.login({ email: RESOURCE_OWNERSHIP.OTHER_EMAIL }),
    ApiHelper.login({ email: RESOURCE_OWNERSHIP.STAFF_EMAIL })
  ]);

  const [payment] = await DbHelper.query<OwnershipIdRow>({ sql: RESOURCE_OWNERSHIP.PAYMENT_SQL, params: [RESOURCE_OWNERSHIP.OWNER_EMAIL] });
  const [account] = await DbHelper.query<OwnershipIdRow>({ sql: RESOURCE_OWNERSHIP.ACCOUNT_SQL, params: [RESOURCE_OWNERSHIP.OWNER_EMAIL] });
  const [entry] = await DbHelper.query<OwnershipEntryRow>({ sql: RESOURCE_OWNERSHIP.ENTRY_SQL, params: [account?.id] });
  const [systemAccount] = await DbHelper.query<OwnershipIdRow>({ sql: RESOURCE_OWNERSHIP.SYSTEM_ACCOUNT_SQL });

  Object.assign(ids, { payment: payment?.id, account: account?.id, transaction: entry?.transaction_id, systemAccount: systemAccount?.id });
});

afterAll(async () => DbHelper.close());

const routes = (): Record<string, string> => ({
  payment: RESOURCE_OWNERSHIP.PAYMENT_PATH(ids.payment),
  ledgerAccount: RESOURCE_OWNERSHIP.ACCOUNT_PATH(ids.account),
  accountEntries: RESOURCE_OWNERSHIP.ACCOUNT_ENTRIES_PATH(ids.account),
  transactionEntries: RESOURCE_OWNERSHIP.TRANSACTION_ENTRIES_PATH(ids.transaction)
});

describe('Resource ownership (payments and ledger)', () => {
  it.each(RESOURCE_OWNERSHIP.ROUTES)('%s: owner 200, other user 404, staff 200', async route => {
    const path = routes()[route] as string;

    await expect(ApiHelper.request({ path, token: tokens.owner })).resolves.toMatchObject({ status: RESOURCE_OWNERSHIP.OK });
    await expect(ApiHelper.request({ path, token: tokens.other })).resolves.toMatchObject({ status: RESOURCE_OWNERSHIP.NOT_FOUND });
    await expect(ApiHelper.request({ path, token: tokens.staff })).resolves.toMatchObject({ status: RESOURCE_OWNERSHIP.OK });
  });

  it('keeps the staff-only views away from users', async () => {
    const allEntries = RESOURCE_OWNERSHIP.ALL_ENTRIES_PATH;
    const systemAccount = RESOURCE_OWNERSHIP.ACCOUNT_PATH(ids.systemAccount);

    await expect(ApiHelper.request({ path: allEntries, token: tokens.owner })).resolves.toMatchObject({ status: RESOURCE_OWNERSHIP.NOT_FOUND });
    await expect(ApiHelper.request({ path: allEntries, token: tokens.staff })).resolves.toMatchObject({ status: RESOURCE_OWNERSHIP.OK });
    await expect(ApiHelper.request({ path: systemAccount, token: tokens.owner })).resolves.toMatchObject({ status: RESOURCE_OWNERSHIP.NOT_FOUND });
  });

  it('answers a malformed ID with 404 for users', async () => {
    await expect(ApiHelper.request({ path: RESOURCE_OWNERSHIP.MALFORMED_PAYMENT_PATH, token: tokens.owner })).resolves.toMatchObject({
      status: RESOURCE_OWNERSHIP.NOT_FOUND
    });
  });
});
