import { SEED_PASSWORD } from '../constants/seed-password.constant';
import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';

interface GameEvent {
  id: string;
  status: string;
  result?: string | null;
}

const PLAYER = 'player18@realtime-wallet-payments.com';
const STAKE_MINOR = 500;
const HOUR_MS = 60 * 60 * 1000;

let admin: string;

let player: string;

let walletId: string;

const createEvent = (): ReturnType<typeof ApiHelper.request<GameEvent>> =>
  ApiHelper.request<GameEvent>({
    method: 'POST',
    path: '/game-events',
    token: admin,
    body: {
      sport: 'Football',
      label: `Lifecycle probe ${Date.now()}`,
      odds: 2.5,
      startsAt: new Date(Date.now() + HOUR_MS).toISOString(),
      bettingClosesAt: new Date(Date.now() + HOUR_MS / 2).toISOString()
    }
  });

const setStatus = (eventId: string, status: string, token = admin): ReturnType<typeof ApiHelper.request<GameEvent>> =>
  ApiHelper.request<GameEvent>({ method: 'PATCH', path: `/game-events/${eventId}/status`, token, body: { status } });

const placeBet = (eventId: string): ReturnType<typeof ApiHelper.request> =>
  ApiHelper.request({
    method: 'POST',
    path: '/bets',
    token: player,
    body: { eventId, walletId, stakeMinor: STAKE_MINOR, selection: 'HOME', idempotencyKey: `lifecycle-${eventId}` }
  });

beforeAll(async () => {
  admin = await ApiHelper.login({ email: 'admin@realtime-wallet-payments.com' });
  player = await ApiHelper.login({ email: PLAYER, password: SEED_PASSWORD });

  const [wallet] = await DbHelper.query<{ id: string }>({
    sql: 'SELECT w.id FROM wallets w JOIN users u ON u.id = w.user_id WHERE u.email = $1',
    params: [PLAYER]
  });

  walletId = wallet?.id as string;
});

afterAll(async () => DbHelper.close());

describe('Game event lifecycle', () => {
  it('creates an event that opens for betting', async () => {
    const created = await createEvent();

    expect(created.status).toBe(201);
    expect(created.body?.status).toBe('SCHEDULED');
    await expect(placeBet(created.body?.id)).resolves.toMatchObject({ status: 201 });
  });

  it('refuses a bet once the event is live', async () => {
    const created = await createEvent();
    const eventId = created.body?.id;

    await expect(setStatus(eventId, 'LIVE')).resolves.toMatchObject({ status: 200, body: { status: 'LIVE' } });

    const refused = await placeBet(eventId);

    expect(refused.status).toBe(409);
  });

  it('refuses a transition the lifecycle does not allow', async () => {
    const created = await createEvent();
    const eventId = created.body?.id;

    await expect(setStatus(eventId, 'SETTLED')).resolves.toMatchObject({ status: 409 });
    await expect(setStatus(eventId, 'CANCELLED')).resolves.toMatchObject({ status: 200 });
    await expect(setStatus(eventId, 'LIVE')).resolves.toMatchObject({ status: 409 });
  });
});

describe('Game event lifecycle: results', () => {
  it('records a result only once the event has finished', async () => {
    const created = await createEvent();
    const eventId = created.body?.id;

    const early = await ApiHelper.request({ method: 'PATCH', path: `/game-events/${eventId}/result`, token: admin, body: { result: 'HOME' } });
    expect(early.status).toBe(409);

    await setStatus(eventId, 'LIVE');
    await setStatus(eventId, 'FINISHED');

    const recorded = await ApiHelper.request<GameEvent>({
      method: 'PATCH',
      path: `/game-events/${eventId}/result`,
      token: admin,
      body: { result: 'HOME' }
    });
    expect(recorded.status).toBe(200);
    expect(recorded.body?.result).toBe('HOME');
  });

  it("keeps the lifecycle out of a player's hands", async () => {
    const created = await createEvent();

    await expect(setStatus(created.body?.id, 'LIVE', player)).resolves.toMatchObject({ status: 403 });
  });
});
