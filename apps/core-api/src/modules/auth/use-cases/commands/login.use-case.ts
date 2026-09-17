import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SessionHelper } from '@common/libs';

import { AuthRepository } from '../../repositories/auth.repository';
import { LoginDto } from '../../dtos/login/login.dto';
import { AuthResponseDto } from '../../dtos/auth/auth-response.dto';
import { AuthBaseUseCase } from '../base/auth-base.use-case';
import { AuthHelper } from '../../helpers/auth.helper';
import { SessionUserDto } from '../../dtos/auth/session-user.dto';

@Injectable()
export class LoginUseCase extends AuthBaseUseCase<LoginDto, AuthResponseDto> {
  constructor (private readonly authRepository: AuthRepository) {
    super();
  }

  async execute (dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.authRepository.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    await SessionHelper.compare({ password: dto.password, passwordHash: user.passwordHash });
    await this.authRepository.update(user.id, { lastLogin: new Date().toISOString() });

    return AuthHelper.createSessionResponse({
      dto: user as SessionUserDto,
      sessionService: this.sessionService,
      configService: this.configService,
      isAuth: true
    }) as unknown as AuthResponseDto;
  }
}
