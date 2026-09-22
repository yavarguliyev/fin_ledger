import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PasswordAlgorithm, SessionHelper, UserStatus } from '@common/libs';

import { AuthRepository } from '../../repositories/auth.repository';
import { LoginDto } from '../../dtos/request/login.dto';
import { AuthResponseDto } from '../../dtos/response/auth-response.dto';
import { AuthBaseUseCase } from '../base/auth-base.use-case';
import { AuthHelper } from '../../helpers/auth.helper';

@Injectable()
export class LoginUseCase extends AuthBaseUseCase<LoginDto, AuthResponseDto> {
  constructor (
    private readonly authRepository: AuthRepository
  ) {
    super();
  }

  async execute (dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.authRepository.findByEmail(dto.email);
    if (!user) return SessionHelper.rejectWithDummyHash({ password: dto.password });

    await SessionHelper.compare({ password: dto.password, passwordHash: user.passwordHash });
    if (user.status !== UserStatus.ACTIVE) throw new UnauthorizedException('Invalid credentials');

    const rehash = SessionHelper.isLegacyHash({ passwordHash: user.passwordHash })
      ? { passwordHash: await SessionHelper.hash({ password: dto.password }), passwordAlgo: PasswordAlgorithm.ARGON2ID }
      : {};

    await this.authRepository.update({ id: user.id, data: { lastLoginAt: new Date().toISOString(), ...rehash } });

    return AuthHelper.createSessionResponse({
      dto: user,
      sessionService: this.sessionService,
      configService: this.configService,
      isAuth: true
    });
  }
}
