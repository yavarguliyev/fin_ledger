import { generateSync } from 'otplib';
import { CryptoHelper } from '@common/shared-libs';

import { ApiHelper } from './api.helper';
import { DbHelper } from './db.helper';
import { MFA_TEST as M } from '../constants/mfa.constant';
import { SEED_PASSWORD } from '../constants/seed-password.constant';
import { ApiResponse } from '../interfaces/api-response.interface';
import {
  MfaChallengeRef,
  MfaDisable,
  MfaEmailRef,
  MfaEnabledBody,
  MfaEnrolment,
  MfaLoginBody,
  MfaSecretRef,
  MfaSetupBody,
  MfaTokenRef,
  MfaTokenRow,
  MfaUriRef,
  MfaVerify
} from '../interfaces/mfa.interface';

export class MfaTestHelper {
  static status ({ token }: MfaTokenRef): Promise<ApiResponse<unknown>> {
    return ApiHelper.request({ path: M.STATUS_PATH, token });
  }

  static setup ({ token }: MfaTokenRef): Promise<ApiResponse<MfaSetupBody>> {
    return ApiHelper.request<MfaSetupBody>({ method: 'POST', path: M.SETUP_PATH, token });
  }

  static secretOf ({ otpauthUri }: MfaUriRef): string {
    return new URL(otpauthUri).searchParams.get(M.SECRET_PARAM) as string;
  }

  static async enrol ({ token }: MfaTokenRef): Promise<MfaEnrolment> {
    const secret = MfaTestHelper.secretOf((await MfaTestHelper.setup({ token })).body);
    const enabled = await ApiHelper.request<MfaEnabledBody>({ method: 'POST', path: M.ENABLE_PATH, token, body: { code: generateSync({ secret }) } });
    return { secret, recoveryCodes: enabled.body.recoveryCodes };
  }

  static disable ({ token, password = SEED_PASSWORD, code }: MfaDisable): Promise<ApiResponse<unknown>> {
    return ApiHelper.request({ method: 'POST', path: M.DISABLE_PATH, token, body: { password, code } });
  }

  static login ({ email }: MfaEmailRef): Promise<ApiResponse<MfaLoginBody>> {
    return ApiHelper.request<MfaLoginBody>({ method: 'POST', path: M.LOGIN_PATH, body: { email, password: SEED_PASSWORD } });
  }

  static verify ({ challengeToken, code }: MfaVerify): Promise<ApiResponse<MfaLoginBody>> {
    return ApiHelper.request<MfaLoginBody>({ method: 'POST', path: M.VERIFY_PATH, body: { challengeToken, code } });
  }

  static tokenRow ({ challengeToken }: MfaChallengeRef): Promise<MfaTokenRow[]> {
    return DbHelper.query<MfaTokenRow>({ sql: M.TOKEN_ROW_SQL, params: [CryptoHelper.sha256({ value: challengeToken })] });
  }

  static nextWindowCode ({ secret }: MfaSecretRef): string {
    return generateSync({ secret, epoch: Math.floor(Date.now() / M.MS_PER_SECOND) + M.WINDOW_SECONDS });
  }
}
