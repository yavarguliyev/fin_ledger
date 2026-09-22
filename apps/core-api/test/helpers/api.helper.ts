import { CryptoHelper } from '@common/shared-libs';

import { SEED_PASSWORD } from '../constants/seed-password.constant';
import { TEST_ENV_KEYS } from '../constants/test-env-keys.constant';
import { ApiRequest } from '../interfaces/api-request.interface';
import { ApiResponse } from '../interfaces/api-response.interface';
import { LoginRequest } from '../interfaces/login-request.interface';

export class ApiHelper {
  static async request<T = unknown> ({ method = 'GET', path, token, body, clientIp = ApiHelper.randomIp() }: ApiRequest): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json', 'X-Forwarded-For': clientIp };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${process.env[TEST_ENV_KEYS.API_URL]}${path}`, {
      method,
      headers,
      ...(body !== undefined && { body: JSON.stringify(body) })
    });

    const text = await response.text();
    return { status: response.status, headers: response.headers, body: (text ? JSON.parse(text) : null) as T };
  }

  static randomIp (): string {
    return `10.${[...CryptoHelper.randomBytes({ bytes: 3 })].join('.')}`;
  }

  static async login ({ email, password = SEED_PASSWORD }: LoginRequest): Promise<string> {
    const response = await ApiHelper.request<{ accessToken: string }>({ method: 'POST', path: '/auth/login', body: { email, password } });
    if (response.status !== 201) throw new Error(`Login failed for ${email}: HTTP ${response.status}`);

    return response.body.accessToken;
  }
}
