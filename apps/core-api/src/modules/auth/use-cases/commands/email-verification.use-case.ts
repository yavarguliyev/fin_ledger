import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { SessionHelper } from '@common/libs';

import { AuthBaseUseCase } from '../base/auth-base.use-case';
import { AuthRepository } from '../../repositories/auth.repository';
import { AuthHelper } from '../../helpers/auth.helper';
import { SessionResponseDto } from '../../dtos/response/session-response.dto';
import { EmailVerificationTokenPayloadDto } from '../../dtos/token/email-verification-token-payload.dto';
import { VerifyEmailDto } from '../../dtos/request/verify-email.dto';

@Injectable()
export class EmailVerificationUseCase extends AuthBaseUseCase<VerifyEmailDto, SessionResponseDto> {
  constructor (private readonly authRepository: AuthRepository) {
    super();
  }

  async execute ({ token, password }: VerifyEmailDto): Promise<SessionResponseDto> {
    const issuer = this.issuer;

    const tokenPayload = jwt.verify(token, this.publicKey, { algorithms: ['RS256'], ...(issuer && { issuer }) }) as EmailVerificationTokenPayloadDto;
    if (tokenPayload.purpose !== 'email_verification') throw new UnauthorizedException('Invalid token purpose');

    const user = await this.authRepository.findByEmailAny(tokenPayload.email);
    if (!user) throw new UnauthorizedException('User not found');

    const passwordHash = await SessionHelper.hash({ password });
    const updatedUser = await this.authRepository.update({ id: user.id, data: {
      isEmailVerified: true,
      emailVerifiedAt: new Date().toISOString(),
      passwordHash,
      passwordChangedAt: new Date().toISOString()
    } });

    if (!updatedUser) throw new UnauthorizedException('Failed to verify email');

    return AuthHelper.createSessionResponse({
      dto: updatedUser,
      sessionService: this.sessionService,
      configService: this.configService,
      isAuth: true
    });
  }
}
