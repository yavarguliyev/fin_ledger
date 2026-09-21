import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

import { AuthBaseUseCase } from '../base/auth-base.use-case';
import { ForgotPasswordDto } from '../../dtos/request/forgot-password.dto';
import { ForgotPasswordResponseDto } from '../../dtos/response/forgot-password-response.dto';
import { AuthRepository } from '../../repositories/auth.repository';
import { EmailHelper } from '../../../email/helpers/email.helper';

@Injectable()
export class ForgotPasswordUseCase extends AuthBaseUseCase<ForgotPasswordDto, ForgotPasswordResponseDto> {
  constructor (private readonly authRepository: AuthRepository) {
    super();
  }

  async execute ({ email }: ForgotPasswordDto): Promise<ForgotPasswordResponseDto> {
    const response = { status: true, message: 'If an account exists for this email, a password reset link has been sent.' };

    const user = await this.authRepository.findByEmail(email);
    if (!user) return response;

    const tokenPayload = { userId: user.id, email: user.email, purpose: 'password_reset' };
    const token = jwt.sign(tokenPayload, this.privateKey, { algorithm: 'RS256', expiresIn: '15m', ...(this.issuer && { issuer: this.issuer }) });
    const resetUrl = `${this.frontendUrl}/auth/reset-password?token=${token}`;

    await EmailHelper.emitKafkaPasswordReset({
      subject: 'Reset Your Password',
      purpose: 'Password Reset',
      title: 'Password Reset Request',
      body: `Click the link below to reset your password. This link will expire in 15 minutes.`,
      url: resetUrl,
      action: 'password_reset',
      publishPasswordReset: this.publishPasswordReset.bind(this)
    });

    return response;
  }
}
