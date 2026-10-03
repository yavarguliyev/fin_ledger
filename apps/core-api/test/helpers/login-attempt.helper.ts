import { ApiHelper } from './api.helper';
import { LOGIN_STATUS_TEST as L } from '../constants/login-status.constant';
import { SEED_PASSWORD } from '../constants/seed-password.constant';
import { ApiResponse } from '../interfaces/api-response.interface';
import { LoginAttempt } from '../interfaces/login-attempt.interface';

export class LoginAttemptHelper {
  static attempt ({ email, password = SEED_PASSWORD }: LoginAttempt): Promise<ApiResponse<unknown>> {
    return ApiHelper.request({ method: 'POST', path: L.LOGIN_PATH, body: { email, password } });
  }

  static async median ({ email, password = L.WRONG_PASSWORD }: LoginAttempt): Promise<number> {
    const timings: number[] = [];
    for (let attempt = 0; attempt < L.TIMING_RUNS; attempt++) {
      const started = performance.now();
      await LoginAttemptHelper.attempt({ email, password });
      timings.push(performance.now() - started);
    }
    return timings.sort((first, second) => first - second)[L.MEDIAN_INDEX] as number;
  }
}
