import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthTokenPurpose, PasswordAlgorithm, SessionHelper, UserStatus } from '@common/libs';

import { AuthRepository } from '../../repositories/auth.repository';
import { AuthTokenRepository } from '../../repositories/auth-token.repository';
import { LoginDto } from '../../dtos/request/login.dto';
import { LoginResponseDto } from '../../dtos/response/login-response.dto';
import { AuthBaseUseCase } from '../base/auth-base.use-case';
import { AuthHelper } from '../../helpers/auth.helper';
import { AuthTokenHelper } from '../../helpers/auth-token.helper';

@Injectable()
export class LoginUseCase extends AuthBaseUseCase<LoginDto, LoginResponseDto> {
  constructor (
    private readonly authRepository: AuthRepository,
    private readonly authTokenRepository: AuthTokenRepository
  ) {
    super();
  }

  async execute (dto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.authRepository.findByEmail({ email: dto.email });
    if (!user) return SessionHelper.rejectWithDummyHash({ password: dto.password });

    await SessionHelper.compare({ password: dto.password, passwordHash: user.passwordHash });
    if (user.status !== UserStatus.ACTIVE) throw new UnauthorizedException('Invalid credentials');

    const rehash = SessionHelper.isLegacyHash({ passwordHash: user.passwordHash })
      ? { passwordHash: await SessionHelper.hash({ password: dto.password }), passwordAlgo: PasswordAlgorithm.ARGON2ID }
      : {};

    if (user.mfaEnabledAt) {
      if (rehash.passwordHash) await this.authRepository.update({ id: user.id, data: rehash });

      const challengeToken = await AuthTokenHelper.issue({ authTokenRepository: this.authTokenRepository, userId: user.id, purpose: AuthTokenPurpose.MFA_CHALLENGE });
      return { mfaRequired: true, challengeToken };
    }

    await this.authRepository.update({ id: user.id, data: { lastLoginAt: new Date().toISOString(), ...rehash } });

    return AuthHelper.createSessionResponse({
      dto: user,
      sessionService: this.sessionService,
      configService: this.configService,
      isAuth: true
    });
  }
}
