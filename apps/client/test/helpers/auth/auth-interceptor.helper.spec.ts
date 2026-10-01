import { AuthInterceptorHelper } from '../../../src/app/core/helpers/auth/auth-interceptor.helper';
import { AUTH_ROUTES_SPEC } from '../../constants/auth-routes.constant';

const url = (path: string): string => `${AUTH_ROUTES_SPEC.BASE}${path}`;

describe('AuthInterceptorHelper.isPublic', () => {
  it('lets through the endpoints that run before a session exists', () => {
    const open = [
      AUTH_ROUTES_SPEC.LOGIN,
      AUTH_ROUTES_SPEC.REGISTER,
      AUTH_ROUTES_SPEC.PASSKEY_LOGIN_OPTIONS,
      AUTH_ROUTES_SPEC.PASSKEY_LOGIN_VERIFY,
      AUTH_ROUTES_SPEC.MFA_VERIFY
    ];

    open.forEach(path => expect(AuthInterceptorHelper.isPublic({ url: url(path) })).toBe(true));
  });

  it('keeps the authenticated neighbours of those paths protected', () => {
    const guarded = [
      AUTH_ROUTES_SPEC.PASSKEY_LIST,
      AUTH_ROUTES_SPEC.PASSKEY_STEP_UP,
      AUTH_ROUTES_SPEC.MFA_STATUS,
      AUTH_ROUTES_SPEC.USERS_ME,
      AUTH_ROUTES_SPEC.SUPPORT_STREAM
    ];

    guarded.forEach(path => expect(AuthInterceptorHelper.isPublic({ url: url(path) })).toBe(false));
  });

  it('does not make sign-out public, because it carries its own token', () => {
    expect(AuthInterceptorHelper.isPublic({ url: url(AUTH_ROUTES_SPEC.LOGOUT) })).toBe(false);
    expect(AuthInterceptorHelper.isPublic({ url: url(AUTH_ROUTES_SPEC.LOGOUT_ALL) })).toBe(false);
  });
});
