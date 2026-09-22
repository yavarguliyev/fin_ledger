import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthTokenPurpose, PostgresService, TotpService, UserStatus } from '@common/libs';

import { AuthBaseUseCase } from '../../base/auth-base.use-case';
import { AuthRepository } from '../../../repositories/auth.repository';
import { AuthTokenRepository } from '../../../repositories/auth-token.repository';
import { MfaRecoveryCodeRepository } from '../../../repositories/mfa-recovery-code.repository';
import { AuthHelper } from '../../../helpers/auth.helper';
import { AuthTokenHelper } from '../../../helpers/auth-token.helper';
import { MfaHelper } from '../../../helpers/mfa.helper';
import { VerifyMfaLoginDto } from '../../../dtos/request/verify-mfa-login.dto';
import { SessionResponseDto } from '../../../dtos/response/session-response.dto';

@Injectable()
export class VerifyMfaLoginUseCase extends AuthBaseUseCase<VerifyMfaLoginDto, SessionResponseDto> {
  constructor (
    private readonly postgresService: PostgresService,
    private readonly authRepository: AuthRepository,
    private readonly authTokenRepository: AuthTokenRepository,
    private readonly mfaRecoveryCodeRepository: MfaRecoveryCodeRepository,
    private readonly totpService: TotpService
  ) {
    super();
  }

  async execute ({ challengeToken, code }: VerifyMfaLoginDto): Promise<SessionResponseDto> {
    const { authTokenRepository, mfaRecoveryCodeRepository, totpService } = this;
    const purposes = [AuthTokenPurpose.MFA_CHALLENGE];

    const { userId } = await AuthTokenHelper.peek({ authTokenRepository, token: challengeToken, purposes });
    const user = await this.authRepository.findById({ id: userId });
    if (!user || user.deletedAt || user.status !== UserStatus.ACTIVE || !user.mfaEnabledAt) throw new UnauthorizedException('Invalid credentials');

    let codeRejected = false;

    try {
      const signedInUser = await this.postgresService.getWriteConnection().transaction({
        callback: async adapter => {
          const result = await MfaHelper.verifySecondFactor({ user, code, totpService, mfaRecoveryCodeRepository, adapter }).catch((error: unknown) => {
            codeRejected = true;
            throw error;
          });

          await AuthTokenHelper.claim({ authTokenRepository, token: challengeToken, purposes, adapter });

          return this.authRepository.update({
            id: userId,
            data: { lastLoginAt: new Date().toISOString(), ...(result.timeStep !== undefined && { mfaLastUsedStep: result.timeStep }) },
            adapter
          });
        }
      });

      if (!signedInUser) throw new UnauthorizedException('Invalid credentials');

      return AuthHelper.createSessionResponse({ dto: signedInUser, sessionService: this.sessionService, configService: this.configService, isAuth: true });
    } catch (error) {
      if (codeRejected) await AuthTokenHelper.recordFailure({ authTokenRepository, token: challengeToken });
      throw error;
    }
  }
}
