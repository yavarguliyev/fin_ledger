import { GAME_EVENT_LIFECYCLE as G } from '../constants/game-event-lifecycle.constant';
import { SEED_PASSWORD } from '../constants/seed-password.constant';
import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { LifecycleBetDto, LifecycleEvent, LifecycleIdRow, LifecycleStatusDto } from '../interfaces/game-event-lifecycle.interface';

let admin: string;

let player: string;

let walletId: string;

const createEvent = (): ReturnType<typeof ApiHelper.request<LifecycleEvent>> =>
  ApiHelper.request<LifecycleEvent>({
    method: 'POST',
    path: G.GAME_EVENTS_PATH,
    token: admin,
    body: {
      sport: G.SPORT,
      label: `${G.LABEL} ${Date.now()}`,
      odds: G.ODDS,
      startsAt: new Date(Date.now() + G.HOUR_MS).toISOString(),
      bettingClosesAt: new Date(Date.now() + G.HOUR_MS / 2).toISOString()
    }
  });

const setStatus = ({ eventId, status, token = admin }: LifecycleStatusDto): ReturnType<typeof ApiHelper.request<LifecycleEvent>> =>
  ApiHelper.request<LifecycleEvent>({ method: 'PATCH', path: G.STATUS_PATH(eventId), token, body: { status } });

const placeBet = ({ eventId }: LifecycleBetDto): ReturnType<typeof ApiHelper.request> =>
  ApiHelper.request({
    method: 'POST',
    path: G.BETS_PATH,
    token: player,
    body: { eventId, walletId, stakeMinor: G.STAKE_MINOR, selection: G.HOME, idempotencyKey: `${G.KEY_PREFIX}${eventId}` }
  });

const recordResult = ({ eventId }: LifecycleBetDto): ReturnType<typeof ApiHelper.request<LifecycleEvent>> =>
  ApiHelper.request<LifecycleEvent>({ method: 'PATCH', path: G.RESULT_PATH(eventId), token: admin, body: { result: G.HOME } });

beforeAll(async () => {
  admin = await ApiHelper.login({ email: G.ADMIN_EMAIL });
  player = await ApiHelper.login({ email: G.PLAYER_EMAIL, password: SEED_PASSWORD });

  const [wallet] = await DbHelper.query<LifecycleIdRow>({ sql: G.WALLET_SQL, params: [G.PLAYER_EMAIL] });

  walletId = wallet?.id as string;
});

afterAll(async () => DbHelper.close());

describe('Game event lifecycle', () => {
  it('creates an event that opens for betting', async () => {
    const created = await createEvent();

    expect(created.status).toBe(G.CREATED);
    expect(created.body?.status).toBe(G.SCHEDULED);
    await expect(placeBet({ eventId: created.body?.id })).resolves.toMatchObject({ status: G.CREATED });
  });

  it('refuses a bet once the event is live', async () => {
    const eventId = (await createEvent()).body?.id;

    await expect(setStatus({ eventId, status: G.LIVE })).resolves.toMatchObject({ status: G.OK, body: { status: G.LIVE } });

    const refused = await placeBet({ eventId });

    expect(refused.status).toBe(G.CONFLICT);
  });

  it('refuses a transition the lifecycle does not allow', async () => {
    const eventId = (await createEvent()).body?.id;

    await expect(setStatus({ eventId, status: G.SETTLED })).resolves.toMatchObject({ status: G.CONFLICT });
    await expect(setStatus({ eventId, status: G.CANCELLED })).resolves.toMatchObject({ status: G.OK });
    await expect(setStatus({ eventId, status: G.LIVE })).resolves.toMatchObject({ status: G.CONFLICT });
  });
});

describe('Game event lifecycle: results', () => {
  it('records a result only once the event has finished', async () => {
    const eventId = (await createEvent()).body?.id;

    expect((await recordResult({ eventId })).status).toBe(G.CONFLICT);

    await setStatus({ eventId, status: G.LIVE });
    await setStatus({ eventId, status: G.FINISHED });

    const recorded = await recordResult({ eventId });
    expect(recorded.status).toBe(G.OK);
    expect(recorded.body?.result).toBe(G.HOME);
  });

  it("keeps the lifecycle out of a player's hands", async () => {
    const created = await createEvent();

    await expect(setStatus({ eventId: created.body?.id, status: G.LIVE, token: player })).resolves.toMatchObject({ status: G.FORBIDDEN });
  });
});
