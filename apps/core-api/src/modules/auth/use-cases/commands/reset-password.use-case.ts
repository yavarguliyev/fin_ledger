import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { SessionHelper } from '@common/libs';

import { AuthBaseUseCase } from '../base/auth-base.use-case';
import { ResetPasswordDto } from '../../dtos/request/reset-password.dto';
import { ResetPasswordResponseDto } from '../../dtos/response/reset-password-response.dto';
import { PasswordResetTokenPayloadDto } from '../../dtos/token/password-reset-token-payload.dto';
import { AuthRepository } from '../../repositories/auth.repository';

@Injectable()
export class ResetPasswordUseCase extends AuthBaseUseCase<ResetPasswordDto, ResetPasswordResponseDto> {
  constructor (private readonly authRepository: AuthRepository) {
    super();
  }

  async execute (dto: ResetPasswordDto): Promise<ResetPasswordResponseDto> {
    const issuer = this.issuer;

    const tokenPayload = jwt.verify(dto.token, this.publicKey, { algorithms: ['RS256'], ...(issuer && { issuer }) }) as PasswordResetTokenPayloadDto;
    if (tokenPayload.purpose !== 'password_reset') throw new UnauthorizedException('Invalid token purpose');

    const user = await this.authRepository.findByEmail(tokenPayload.email);
    if (!user || user.deletedAt) throw new UnauthorizedException('User not found');

    const passwordHash = await SessionHelper.hash({ password: dto.password });

    await this.authRepository.update({ id: user.id, data: { passwordHash, passwordChangedAt: new Date().toISOString() } });
    await this.sessionService.deleteUserSessions({ userId: user.id });

    return { success: true, message: 'Password reset successfully. Please login with your new password.' };
  }
}
