import { SEED_PASSWORD } from '../constants/seed-password.constant';
import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';

describe('Suspending and reactivating users', () => {
  const email = 'player9@seed.local';
  let admin: string;
  let userId: string;

  const login = (): ReturnType<typeof ApiHelper.request> => ApiHelper.request({ method: 'POST', path: '/auth/login', body: { email, password: SEED_PASSWORD } });
  const changeStatus = (action: 'suspend' | 'reactivate', token = admin, id = userId): ReturnType<typeof ApiHelper.request<{ status: string }>> =>
    ApiHelper.request<{ status: string }>({ method: 'POST', path: `/users/${id}/${action}`, token });

  beforeAll(async () => {
    admin = await ApiHelper.login({ email: 'admin@seed.local' });
    const [user] = await DbHelper.query<{ id: string }>({ sql: 'SELECT id FROM users WHERE email = $1', params: [email] });
    userId = user?.id as string;
  });

  afterAll(async () => DbHelper.close());

  it('ends the open session on suspension and blocks login until reactivated', async () => {
    const session = await ApiHelper.login({ email });
    await expect(ApiHelper.request({ method: 'GET', path: '/wallets', token: session })).resolves.toMatchObject({ status: 200 });

    await expect(changeStatus('suspend')).resolves.toMatchObject({ status: 201, body: { status: 'SUSPENDED' } });
    await expect(ApiHelper.request({ method: 'GET', path: '/wallets', token: session })).resolves.toMatchObject({ status: 401 });
    await expect(login()).resolves.toMatchObject({ status: 401, body: { error: { message: 'Invalid credentials' } } });

    await expect(changeStatus('suspend')).resolves.toMatchObject({ status: 409 });
    await expect(changeStatus('reactivate')).resolves.toMatchObject({ status: 201, body: { status: 'ACTIVE' } });
    await expect(login()).resolves.toMatchObject({ status: 201 });
  });

  it('shows the account status in the admin user list so the table can act on it', async () => {
    const dashboard = (): ReturnType<typeof ApiHelper.request<{ users: { id: string; user_status: string; status: string | null }[] }>> =>
      ApiHelper.request<{ users: { id: string; user_status: string; status: string | null }[] }>({ method: 'GET', path: '/admin/dashboard', token: admin });

    const before = await dashboard();
    const listed = before.body?.users.find(user => user.id === userId);

    expect(listed?.user_status).toBe('ACTIVE');

    await expect(changeStatus('suspend')).resolves.toMatchObject({ status: 201 });

    const after = await dashboard();
    const suspended = after.body?.users.find(user => user.id === userId);

    expect(suspended?.user_status).toBe('SUSPENDED');
    expect(suspended?.status).not.toBe('SUSPENDED');

    await expect(changeStatus('reactivate')).resolves.toMatchObject({ status: 201 });
  });

  it('never reactivates a closed account', async () => {
    await DbHelper.query({ sql: "UPDATE users SET status = 'CLOSED' WHERE id = $1", params: [userId] });

    await expect(changeStatus('reactivate')).resolves.toMatchObject({ status: 409 });
    await expect(DbHelper.query({ sql: 'SELECT status FROM users WHERE id = $1', params: [userId] })).resolves.toEqual([{ status: 'CLOSED' }]);
  });

  it('refuses self-suspension and non-admins', async () => {
    const [self] = await DbHelper.query<{ id: string }>({ sql: "SELECT id FROM users WHERE email = 'admin@seed.local'" });
    await expect(changeStatus('suspend', admin, self?.id)).resolves.toMatchObject({ status: 400 });

    const player = await ApiHelper.login({ email: 'player1@seed.local' });
    await expect(changeStatus('suspend', player)).resolves.toMatchObject({ status: 403 });
  });
});
