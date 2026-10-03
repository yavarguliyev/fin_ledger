import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { HTTP_STATUS } from '../constants/http-status.constant';
import { WEBHOOK_PROVIDER_TEST as T } from '../constants/webhook-provider.constant';

afterAll(async () => {
  await DbHelper.close();
});

describe('Webhook provider check', () => {
  it('refuses a provider that is not registered, names the available ones and records nothing', async () => {
    const response = await ApiHelper.request<{ message: string }>({
      method: T.METHOD,
      path: T.UNKNOWN_PROVIDER_PATH,
      body: { id: T.EVENT_ID, type: T.EVENT_TYPE }
    });

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(JSON.stringify(response.body)).toMatch(T.UNSUPPORTED);

    const [row] = await DbHelper.query<{ count: number }>({ sql: T.SQL_COUNT, params: [T.EVENT_ID] });
    expect(row?.count).toBe(0);
  });
});
