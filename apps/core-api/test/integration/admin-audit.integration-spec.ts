import { ADMIN_AUDIT_TEST as T } from '../constants/admin-audit.constant';
import { ApiHelper } from '../helpers/api.helper';
import { AuditLogHelper } from '../helpers/audit-log.helper';
import { DbHelper } from '../helpers/db.helper';
import { TestUserHelper } from '../helpers/test-user.helper';

const createEvent = (token: string): ReturnType<typeof ApiHelper.request<{ id: string }>> =>
  ApiHelper.request<{ id: string }>({
    method: 'POST',
    path: T.GAME_EVENTS_PATH,
    token,
    body: {
      sport: T.SPORT,
      label: `${T.LABEL} ${Date.now()}`,
      odds: T.ODDS,
      startsAt: new Date(Date.now() + T.HOUR_MS).toISOString(),
      bettingClosesAt: new Date(Date.now() + T.HOUR_MS / 2).toISOString()
    }
  });

describe('Auditing admin actions on game events and wallets', () => {
  let admin: string;

  const patch = (path: string, body: object): ReturnType<typeof ApiHelper.request<{ id: string }>> =>
    ApiHelper.request<{ id: string }>({ method: 'PATCH', path, token: admin, body });

  beforeAll(async () => {
    await TestUserHelper.ensure({ emails: [T.OWNER_EMAIL] });
    admin = await ApiHelper.login({ email: T.ADMIN_EMAIL });
  });

  afterAll(async () => DbHelper.close());

  it('records creating, moving and resulting a game event under the named actions', async () => {
    const created = await createEvent(admin);
    const eventId = created.body?.id;
    const eventPath = `${T.GAME_EVENTS_PATH}/${eventId}`;

    await patch(`${eventPath}${T.STATUS_SUFFIX}`, { status: T.LIVE });
    await patch(`${eventPath}${T.STATUS_SUFFIX}`, { status: T.FINISHED });
    await patch(`${eventPath}${T.RESULT_SUFFIX}`, { result: T.RESULT });

    for (const action of T.GAME_EVENT_ACTIONS) {
      await expect(AuditLogHelper.waitFor({ entityId: eventId, action })).resolves.toEqual({
        action,
        entity_type: T.GAME_EVENT_ENTITY,
        entity_id: eventId
      });
    }
  });

  it('records a wallet status change against the wallet', async () => {
    const owner = await ApiHelper.login({ email: T.OWNER_EMAIL });
    const opened = await ApiHelper.request<{ id: string }>({ method: 'POST', path: T.WALLETS_PATH, token: owner, body: { currency: T.CURRENCY } });
    const walletId = opened.body?.id;
    const statusPath = `${T.WALLETS_PATH}/${walletId}${T.STATUS_SUFFIX}`;

    await patch(statusPath, { status: T.SUSPENDED });
    await patch(statusPath, { status: T.ACTIVE });

    await expect(AuditLogHelper.waitFor({ entityId: walletId, action: T.WALLET_STATUS_CHANGED })).resolves.toEqual({
      action: T.WALLET_STATUS_CHANGED,
      entity_type: T.WALLET_ENTITY,
      entity_id: walletId
    });
  });
});
