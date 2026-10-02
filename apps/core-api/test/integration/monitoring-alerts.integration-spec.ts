import { MONITORING_ALERTS_TEST as T } from '../constants/monitoring-alerts.constant';
import { DbHelper } from '../helpers/db.helper';
import { TEST_ENV_KEYS } from '../constants/test-env-keys.constant';

const post = async (authorization: string): Promise<number> => {
  const response = await fetch(`${process.env[TEST_ENV_KEYS.API_URL]}${T.PATH}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: authorization },
    body: JSON.stringify({
      status: T.FIRING,
      alerts: [
        {
          status: T.FIRING,
          labels: { alertname: T.ALERT_NAME, severity: T.SEVERITY },
          annotations: { summary: T.SUMMARY, description: T.DESCRIPTION }
        }
      ]
    })
  });
  return response.status;
};

describe('Alertmanager alerts reach the admins', () => {
  afterAll(async () => DbHelper.close());

  it('refuses a webhook without the shared token', async () => {
    await expect(post(T.WRONG_TOKEN)).resolves.toBe(T.UNAUTHORIZED);
  });

  it('turns a firing alert into an admin notification and an e-mail', async () => {
    await expect(post(`${T.BEARER}${T.TOKEN}`)).resolves.toBe(T.NO_CONTENT);

    const notifications = await DbHelper.query<{ content: string }>({ sql: T.NOTIFICATION_SQL, params: [T.ADMIN_EMAIL, T.TITLE] });
    const emails = await DbHelper.query<{ to: string }>({ sql: T.EMAIL_SQL, params: [T.EMAIL_EVENT, T.TITLE] });

    expect(notifications[0]?.content).toBe(`${T.SUMMARY}. ${T.DESCRIPTION}`);
    expect(emails.map(row => row.to)).toContain(T.ADMIN_EMAIL);
  });
});
