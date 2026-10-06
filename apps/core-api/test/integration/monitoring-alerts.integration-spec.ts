import { MONITORING_ALERTS_TEST as T } from '../constants/monitoring-alerts.constant';
import { DbHelper } from '../helpers/db.helper';
import { TEST_ENV_KEYS } from '../constants/test-env-keys.constant';
import { AlertPostDto } from '../interfaces/alert-post.interface';

const post = async ({ authorization, status, summary, times }: AlertPostDto): Promise<number> => {
  const response = await fetch(`${process.env[TEST_ENV_KEYS.API_URL]}${T.PATH}`, {
    method: T.POST,
    headers: { ...T.JSON_HEADERS, Authorization: authorization },
    body: JSON.stringify({
      status,
      alerts: [{ status, labels: { alertname: T.ALERT_NAME, severity: T.SEVERITY }, annotations: { summary, description: T.DESCRIPTION }, ...times }]
    })
  });
  return response.status;
};

const authorized = `${T.BEARER}${T.TOKEN}`;

describe('Alertmanager alerts reach the admins', () => {
  afterAll(async () => DbHelper.close());

  it('refuses a webhook without the shared token', async () => {
    await expect(post({ authorization: T.WRONG_TOKEN, status: T.FIRING, summary: T.SUMMARY })).resolves.toBe(T.UNAUTHORIZED);
  });

  it('turns a firing alert into an admin notification and an e-mail', async () => {
    await expect(post({ authorization: authorized, status: T.FIRING, summary: T.SUMMARY })).resolves.toBe(T.NO_CONTENT);

    const notifications = await DbHelper.query<{ content: string }>({ sql: T.NOTIFICATION_SQL, params: [T.ADMIN_EMAIL, T.TITLE] });
    const emails = await DbHelper.query<{ to: string }>({ sql: T.EMAIL_SQL, params: [T.EMAIL_EVENT, T.TITLE] });

    expect(notifications[0]?.content).toBe(T.DESCRIPTION);
    expect(emails.map(row => row.to)).toContain(T.ADMIN_EMAIL);
  });

  it('says how long a resolved alert lasted instead of repeating its description', async () => {
    const times = { startsAt: T.STARTS_AT, endsAt: T.ENDS_AT };
    await expect(post({ authorization: authorized, status: T.RESOLVED, summary: T.RESOLVED_SUMMARY, times })).resolves.toBe(T.NO_CONTENT);

    const notifications = await DbHelper.query<{ content: string }>({ sql: T.NOTIFICATION_SQL, params: [T.ADMIN_EMAIL, T.RESOLVED_TITLE] });

    expect(notifications[0]?.content).toBe(T.LASTED);
  });
});
