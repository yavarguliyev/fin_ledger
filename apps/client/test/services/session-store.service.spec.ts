import { SessionStore } from '../../src/app/core/services/session-store.service';
import { AuthResponse } from '../../src/app/core/interfaces/auth/auth-response.interface';
import { AuthUser } from '../../src/app/core/types/auth/auth-user.type';

const USER = { id: 'user-1', email: 'ada@realtime-wallet-payments.com', displayName: 'Ada', role: 'USER' } as AuthUser;
const EXPIRES_IN = 900;
const SESSION: AuthResponse = { tokenType: 'Bearer', accessToken: 'access-1', expiresIn: EXPIRES_IN, user: USER };
const NOW = 1_700_000_000_000;
const MILLISECONDS_PER_SECOND = 1_000;

describe('SessionStore', () => {
  let store: SessionStore;

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(NOW);
    localStorage.clear();
    store = new SessionStore();
  });

  afterEach(() => jest.restoreAllMocks());

  it('starts with nothing, so a reload is unauthenticated until the refresh cookie is exchanged', () => {
    expect(store.token()).toBeNull();
    expect(store.user()).toBeNull();
    expect(store.expiresAt()).toBe(0);
  });

  it('records when the access token stops being usable', () => {
    store.adopt({ session: SESSION });

    expect(store.token()).toBe(SESSION.accessToken);
    expect(store.user()).toBe(USER);
    expect(store.expiresAt()).toBe(NOW + EXPIRES_IN * MILLISECONDS_PER_SECOND);
  });

  it('keeps the session when only the profile changed', () => {
    const renamed = { ...USER, displayName: 'Ada Lovelace' };

    store.adopt({ session: SESSION });
    store.adoptUser({ user: renamed });

    expect(store.user()).toBe(renamed);
    expect(store.token()).toBe(SESSION.accessToken);
  });

  it('remembers that someone signed in, so a reload knows a refresh is worth trying', () => {
    expect(store.wasSignedIn()).toBe(false);

    store.adopt({ session: SESSION });

    expect(store.wasSignedIn()).toBe(true);
  });

  it('forgets the sign-in on its own, so a dead refresh cookie is not retried on every load', () => {
    store.adopt({ session: SESSION });
    store.forgetSignIn();

    expect(store.wasSignedIn()).toBe(false);
    expect(store.token()).toBe(SESSION.accessToken);
  });

  it('drops the expiry and the sign-in hint along with the token on logout', () => {
    store.adopt({ session: SESSION });
    store.clear();

    expect(store.token()).toBeNull();
    expect(store.user()).toBeNull();
    expect(store.expiresAt()).toBe(0);
    expect(store.wasSignedIn()).toBe(false);
  });
});
