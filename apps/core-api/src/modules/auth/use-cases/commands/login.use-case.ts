import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthTokenPurpose, RequestScope, SessionHelper, UserStatus } from '@common/libs';

import { AuthRepository } from '../../repositories/auth.repository';
import { AuthTokenRepository } from '../../repositories/auth-token.repository';
import { LoginDto } from '../../dtos/request/login.dto';
import { LoginResponseDto } from '../../dtos/response/login-response.dto';
import { AuthBaseUseCase } from '../base/auth-base.use-case';
import { AuthHelper } from '../../helpers/auth.helper';
import { AuthTokenHelper } from '../../helpers/auth-token.helper';
import { LockoutHelper } from '../../helpers/lockout.helper';
import { LOCKOUT } from '../../constants/lockout/lockout.constant';
import { DeviceTrackerService } from '../../services/device-tracker.service';

@Injectable()
export class LoginUseCase extends AuthBaseUseCase<LoginDto, LoginResponseDto> {
  constructor (
    private readonly authRepository: AuthRepository,
    private readonly authTokenRepository: AuthTokenRepository,
    private readonly deviceTracker: DeviceTrackerService
  ) {
    super();
  }

  async execute (dto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.authRepository.findByEmail({ email: dto.email });
    if (!user) return SessionHelper.rejectWithDummyHash({ password: dto.password });
    const matches = await SessionHelper.matches({ password: dto.password, passwordHash: user.passwordHash });

    if (!matches) {
      await this.authRepository.update({ id: user.id, data: LockoutHelper.afterFailure(user) });
      throw new UnauthorizedException(LOCKOUT.INVALID_CREDENTIALS);
    }

    if (LockoutHelper.isLocked(user)) throw new UnauthorizedException(LOCKOUT.INVALID_CREDENTIALS);
    if (user.status !== UserStatus.ACTIVE) throw new UnauthorizedException(LOCKOUT.INVALID_CREDENTIALS);

    if (user.mfaEnabledAt) {
      const challengeToken = await AuthTokenHelper.issue({
        authTokenRepository: this.authTokenRepository,
        userId: user.id,
        purpose: AuthTokenPurpose.MFA_CHALLENGE
      });

      return { mfaRequired: true, challengeToken };
    }

    const lastLoginIp = RequestScope.clientIp();

    await this.authRepository.update({
      id: user.id,
      data: {
        lastLoginAt: new Date().toISOString(),
        ...LockoutHelper.cleared(),
        ...(lastLoginIp && { lastLoginIp })
      }
    });

    await this.deviceTracker.track({ userId: user.id, email: user.email });

    return AuthHelper.createSessionResponse({
      dto: user,
      sessionService: this.sessionService,
      configService: this.configService,
      refreshToken: await this.refreshService.issue({ userId: user.id })
    });
  }
}
