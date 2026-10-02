import { CryptoHelper } from '@common/shared-libs';

import { REFRESH_COOKIE_NAME } from '../constants/refresh-cookie-name.constant';
import { SEED_PASSWORD } from '../constants/seed-password.constant';
import { TEST_ENV_KEYS } from '../constants/test-env-keys.constant';
import { ApiRequest } from '../interfaces/api-request.interface';
import { ApiResponse } from '../interfaces/api-response.interface';
import { LoginRequest } from '../interfaces/login-request.interface';

export class ApiHelper {
  static async request<T = unknown> ({
    method = 'GET',
    path,
    token,
    body,
    cookie,
    deviceId,
    clientIp = ApiHelper.randomIp()
  }: ApiRequest): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json', 'X-Forwarded-For': clientIp };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (cookie) headers['Cookie'] = cookie;
    if (deviceId) headers['X-Device-Id'] = deviceId;

    const response = await fetch(`${process.env[TEST_ENV_KEYS.API_URL]}${path}`, {
      method,
      headers,
      ...(body !== undefined && { body: JSON.stringify(body) })
    });

    const text = await response.text();
    return { status: response.status, headers: response.headers, body: (text ? JSON.parse(text) : null) as T };
  }

  static async stream ({ path, token, clientIp = ApiHelper.randomIp() }: ApiRequest): Promise<number> {
    const controller = new AbortController();
    const headers: Record<string, string> = { 'X-Forwarded-For': clientIp };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const response = await fetch(`${process.env[TEST_ENV_KEYS.API_URL]}${path}`, { headers, signal: controller.signal });
      return response.status;
    } finally {
      controller.abort();
    }
  }

  static refreshCookie<T> ({ headers }: ApiResponse<T>): string {
    const cookie = headers.getSetCookie().find(entry => entry.startsWith(`${REFRESH_COOKIE_NAME}=`));
    if (!cookie) throw new Error('The response carried no refresh cookie');
    return cookie.split(';')[0] as string;
  }

  static randomIp (): string {
    return `10.${[...CryptoHelper.randomBytes({ bytes: 3 })].join('.')}`;
  }

  static async login ({ email, password = SEED_PASSWORD }: LoginRequest): Promise<string> {
    const response = await ApiHelper.request<{ accessToken: string }>({ method: 'POST', path: '/auth/login', body: { email, password } });
    if (response.status !== 201) throw new Error(`Login failed for ${email}: HTTP ${response.status}`);
    if (!response.body.accessToken) throw new Error(`Login for ${email} returned no access token (two-factor still enabled?)`);
    return response.body.accessToken;
  }
}
