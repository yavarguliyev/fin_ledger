import { LEDGER_INTEGRITY_TEST as T } from '../constants/ledger-integrity.constant';
import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { BalanceShift, IntegrityReport } from '../interfaces/ledger-integrity.interface';

describe('Ledger integrity check', () => {
  let admin: string;

  const report = (): ReturnType<typeof ApiHelper.request<IntegrityReport>> =>
    ApiHelper.request<IntegrityReport>({ method: T.GET, path: T.PATH, token: admin });

  const shiftBalance = ({ delta }: BalanceShift): ReturnType<typeof DbHelper.query> =>
    DbHelper.query({ sql: T.SHIFT_SQL, params: [T.PLAYER_EMAIL, delta] });

  beforeAll(async () => {
    admin = await ApiHelper.login({ email: T.ADMIN_EMAIL });
  });

  afterAll(async () => DbHelper.close());

  it('reports a clean ledger as healthy', async () => {
    await expect(report()).resolves.toMatchObject({ status: T.OK, body: T.HEALTHY_REPORT });
  });

  it('detects a wallet balance that no longer matches its ledger account', async () => {
    await shiftBalance({ delta: T.DRIFT });

    try {
      await expect(report()).resolves.toMatchObject({ status: T.OK, body: T.DRIFTED_REPORT });
    } finally {
      await shiftBalance({ delta: -T.DRIFT });
    }

    await expect(report()).resolves.toMatchObject({ body: T.HEALTHY });
  });

  it('is only available to admins', async () => {
    const player = await ApiHelper.login({ email: T.PLAYER_EMAIL });
    await expect(ApiHelper.request({ method: T.GET, path: T.PATH, token: player })).resolves.toMatchObject({ status: T.FORBIDDEN });
  });
});
