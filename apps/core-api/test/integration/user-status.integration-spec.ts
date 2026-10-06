import { HTTP_STATUS } from '../constants/http-status.constant';
import { SEED_PASSWORD } from '../constants/seed-password.constant';
import { USER_STATUS_TEST as T } from '../constants/user-status.constant';
import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { TestUserHelper } from '../helpers/test-user.helper';
import { AdminUserRow, ChangeStatusDto, UserStatusBody } from '../interfaces/user-status.interface';

let admin: string;

let userId: string;

const login = (): ReturnType<typeof ApiHelper.request> =>
  ApiHelper.request({ method: 'POST', path: T.LOGIN_PATH, body: { email: T.EMAIL, password: SEED_PASSWORD } });

const changeStatus = ({ action, token = admin, id = userId }: ChangeStatusDto): ReturnType<typeof ApiHelper.request<UserStatusBody>> =>
  ApiHelper.request<UserStatusBody>({ method: 'POST', path: T.STATUS_PATH({ id, action }), token });

const dashboard = (): ReturnType<typeof ApiHelper.request<AdminUserRow[]>> =>
  ApiHelper.request<AdminUserRow[]>({ method: 'GET', path: T.USERS_PATH, token: admin });

beforeAll(async () => {
  admin = await ApiHelper.login({ email: T.ADMIN_EMAIL });
  userId = await TestUserHelper.idOf({ email: T.EMAIL });
});

afterAll(async () => DbHelper.close());

describe('Suspending and reactivating users', () => {
  it('ends the open session on suspension and blocks login until reactivated', async () => {
    const session = await ApiHelper.login({ email: T.EMAIL });

    await expect(ApiHelper.request({ method: 'GET', path: T.WALLETS_PATH, token: session })).resolves.toMatchObject({ status: HTTP_STATUS.OK });
    await expect(changeStatus({ action: T.SUSPEND })).resolves.toMatchObject({ status: HTTP_STATUS.CREATED, body: { status: T.SUSPENDED } });
    await expect(ApiHelper.request({ method: 'GET', path: T.WALLETS_PATH, token: session })).resolves.toMatchObject({ status: HTTP_STATUS.UNAUTHORIZED });
    await expect(login()).resolves.toMatchObject({ status: HTTP_STATUS.UNAUTHORIZED, body: { error: { message: T.INVALID_CREDENTIALS } } });
    await expect(changeStatus({ action: T.SUSPEND })).resolves.toMatchObject({ status: HTTP_STATUS.CONFLICT });
    await expect(changeStatus({ action: T.REACTIVATE })).resolves.toMatchObject({ status: HTTP_STATUS.CREATED, body: { status: T.ACTIVE } });
    await expect(login()).resolves.toMatchObject({ status: HTTP_STATUS.CREATED });
  });

  it('shows the account status in the admin user list so the table can act on it', async () => {
    const before = await dashboard();
    const listed = before.body?.find(user => user.id === userId);

    expect(listed?.user_status).toBe(T.ACTIVE);

    await expect(changeStatus({ action: T.SUSPEND })).resolves.toMatchObject({ status: HTTP_STATUS.CREATED });

    const after = await dashboard();
    const suspended = after.body?.find(user => user.id === userId);

    expect(suspended?.user_status).toBe(T.SUSPENDED);
    expect(suspended?.status).not.toBe(T.SUSPENDED);

    await expect(changeStatus({ action: T.REACTIVATE })).resolves.toMatchObject({ status: HTTP_STATUS.CREATED });
  });

  it('never reactivates a closed account', async () => {
    await DbHelper.query({ sql: T.CLOSE_SQL, params: [userId] });
    await expect(changeStatus({ action: T.REACTIVATE })).resolves.toMatchObject({ status: HTTP_STATUS.CONFLICT });
    await expect(DbHelper.query({ sql: T.STATUS_SQL, params: [userId] })).resolves.toEqual([{ status: T.CLOSED }]);
  });
});

describe('Suspending and reactivating users: permissions', () => {
  it('refuses self-suspension and non-admins', async () => {
    const selfId = await TestUserHelper.idOf({ email: T.ADMIN_EMAIL });
    await expect(changeStatus({ action: T.SUSPEND, id: selfId })).resolves.toMatchObject({ status: HTTP_STATUS.BAD_REQUEST });

    const player = await ApiHelper.login({ email: T.PLAYER_EMAIL });
    await expect(changeStatus({ action: T.SUSPEND, token: player })).resolves.toMatchObject({ status: HTTP_STATUS.FORBIDDEN });
  });
});
