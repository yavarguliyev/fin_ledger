import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { WALLET_OVERVIEW_TEST as T } from '../constants/wallet-overview.constant';
import { WalletEmailQuery, WalletIdRow, WalletOverviewBody, WalletPathQuery } from '../interfaces/wallet-overview.interface';

let token: string = T.EMPTY;
let walletId: string = T.EMPTY;

const get = <TBody>({ walletId: id, suffix }: WalletPathQuery): ReturnType<typeof ApiHelper.request<TBody>> =>
  ApiHelper.request<TBody>({ path: `${T.BASE_PATH}${id}${suffix}`, token });

const walletOf = async ({ email }: WalletEmailQuery): Promise<string> => (await DbHelper.query<WalletIdRow>({ sql: T.WALLET_SQL, params: [email] }))[0]?.id ?? T.EMPTY;

beforeAll(async () => {
  token = await ApiHelper.login({ email: T.EMAIL });
  walletId = await walletOf({ email: T.EMAIL });
});

afterAll(async () => DbHelper.close());

describe('Wallet overview', () => {
  it('returns the summary and the first page of activity in one call, matching the separate endpoints', async () => {
    const [overview, summary, transactions] = await Promise.all([
      get<WalletOverviewBody>({ walletId, suffix: T.OVERVIEW }),
      get<unknown[]>({ walletId, suffix: T.SUMMARY }),
      get<WalletOverviewBody['recent']>({ walletId, suffix: T.TRANSACTIONS })
    ]);

    expect(overview.status).toBe(T.OK);
    expect(overview.body.summary).toEqual(summary.body);
    expect(overview.body.recent).toEqual(transactions.body);
  });

  it("refuses another player's wallet", async () => {
    const other = await walletOf({ email: T.OTHER_EMAIL });

    await expect(get<WalletOverviewBody>({ walletId: other, suffix: T.OVERVIEW })).resolves.toMatchObject({ status: T.FORBIDDEN });
  });
});
