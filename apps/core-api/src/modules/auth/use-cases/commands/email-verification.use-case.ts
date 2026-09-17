import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { SessionHelper } from '@common/libs';

import { AuthBaseUseCase } from '../base/auth-base.use-case';
import { AuthRepository } from '../../repositories/auth.repository';
import { SessionUserDto } from '../../dtos/auth/session-user.dto';
import { AuthHelper } from '../../helpers/auth.helper';
import { SessionResponseDto } from '../../dtos/auth/session-response.dto';
import { EmailVerificationTokenPayload } from '../../dtos/auth/auth.dto';
import { VerifyEmailDto } from '../../dtos/auth/set-password.dto';

@Injectable()
export class EmailVerificationUseCase extends AuthBaseUseCase<VerifyEmailDto, SessionResponseDto> {
  constructor (private readonly authRepository: AuthRepository) {
    super();
  }

  async execute ({ token, password }: VerifyEmailDto): Promise<SessionResponseDto> {
    const issuer = this.issuer;

    const tokenPayload = jwt.verify(token, this.publicKey, { algorithms: ['RS256'], ...(issuer && { issuer }) }) as EmailVerificationTokenPayload;
    if (tokenPayload.purpose !== 'email_verification') throw new UnauthorizedException('Invalid token purpose');

    const user = await this.authRepository.findByEmailAny(tokenPayload.email);
    if (!user) throw new UnauthorizedException('User not found');

    const passwordHash = await SessionHelper.hash({ password });
    const updatedUser = await this.authRepository.update(user.id, { isEmailVerified: true, passwordHash });
    if (!updatedUser) throw new UnauthorizedException('Failed to verify email');

    return AuthHelper.createSessionResponse({
      dto: updatedUser as SessionUserDto,
      sessionService: this.sessionService,
      configService: this.configService,
      isAuth: true
    });
  }
}
