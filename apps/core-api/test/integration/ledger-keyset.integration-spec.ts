import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { LEDGER_KEYSET_TEST as T } from '../constants/ledger-keyset.constant';
import { LedgerEntryItem, LedgerPageQuery } from '../interfaces/ledger-keyset.interface';

let token: string = T.EMPTY;
let accountId: string = T.EMPTY;

const page = ({ query }: LedgerPageQuery): ReturnType<typeof ApiHelper.request<LedgerEntryItem[]>> =>
  ApiHelper.request<LedgerEntryItem[]>({ path: `${T.ENTRIES_PATH}${accountId}${T.ENTRIES_SUFFIX}${new URLSearchParams(query).toString()}`, token });

beforeAll(async () => {
  token = await ApiHelper.login({ email: T.EMAIL });
  accountId = (await DbHelper.query<{ id: string }>({ sql: T.ACCOUNT_SQL, params: [T.EMAIL] }))[0]?.id ?? T.EMPTY;
});

afterAll(async () => DbHelper.close());

describe('Ledger entries paged by cursor', () => {
  it('walks every entry newest first, a page at a time, matching the database order', async () => {
    const seen: string[] = [];
    let response = await page({ query: { limit: String(T.PAGE) } });

    while (response.body.length > 0) {
      expect(response.status).toBe(T.OK);
      seen.push(...response.body.map(entry => entry.id));
      const last = response.body.at(-1);
      response = await page({ query: { limit: String(T.PAGE), before: last?.createdAt ?? T.EMPTY, beforeId: last?.id ?? T.EMPTY } });
    }

    const expected = await DbHelper.query<{ id: string }>({ sql: T.ENTRY_IDS_SQL, params: [accountId] });
    expect(seen).toEqual(expected.map(row => row.id));
  });

  it('refuses half a cursor', async () => {
    await expect(page({ query: { before: new Date().toISOString() } })).resolves.toMatchObject({ status: T.BAD_REQUEST });
  });
});
