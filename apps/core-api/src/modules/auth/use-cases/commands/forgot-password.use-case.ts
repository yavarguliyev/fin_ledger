import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

import { AuthBaseUseCase } from '../base/auth-base.use-case';
import { ForgotPasswordResponse } from '../../dtos/auth/forgot-password-response.dto';
import { AuthRepository } from '../../repositories/auth.repository';
import { EmailHelper } from '../../../email/helpers/email.helper';

@Injectable()
export class ForgotPasswordUseCase extends AuthBaseUseCase<string, ForgotPasswordResponse> {
  constructor (private readonly authRepository: AuthRepository) {
    super();
  }

  async execute (email: string): Promise<ForgotPasswordResponse> {
    const user = await this.authRepository.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

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

    return { status: true, message: 'Password reset email sent successfully.', token };
  }
}
