import { ApiHelper } from './api.helper';
import { SEED_PASSWORD } from '../constants/seed-password.constant';
import { SESSION_POLICY as S } from '../constants/session-policy.constant';
import { ApiResponse } from '../interfaces/api-response.interface';
import { SessionCookieRef, SessionEmailRef, SessionTokenRef } from '../interfaces/session-test.interface';
import { SessionTokens } from '../interfaces/session-tokens.interface';

export class SessionTestHelper {
  static async signIn ({ email }: SessionEmailRef): Promise<ApiResponse<SessionTokens>> {
    const response = await ApiHelper.request<SessionTokens>({ method: 'POST', path: S.LOGIN_PATH, body: { email, password: SEED_PASSWORD } });
    expect(response.status).toBe(S.CREATED);
    return response;
  }

  static refresh ({ cookie }: SessionCookieRef): Promise<ApiResponse<SessionTokens>> {
    return ApiHelper.request<SessionTokens>({ method: 'POST', path: S.REFRESH_PATH, cookie, body: {} });
  }

  static async walletsStatus ({ token }: SessionTokenRef): Promise<number> {
    return (await ApiHelper.request({ path: S.WALLETS_PATH, token })).status;
  }
}
