import { Injectable } from '@nestjs/common';
import { AuthTokenPurpose } from '@common/libs';

import { AuthBaseUseCase } from '../base/auth-base.use-case';
import { ForgotPasswordDto } from '../../dtos/request/forgot-password.dto';
import { ForgotPasswordResponseDto } from '../../dtos/response/forgot-password-response.dto';
import { AuthRepository } from '../../repositories/auth.repository';
import { AuthTokenRepository } from '../../repositories/auth-token.repository';
import { AuthTokenHelper } from '../../helpers/auth-token.helper';
import { EmailHelper } from '../../../email/helpers/email.helper';

@Injectable()
export class ForgotPasswordUseCase extends AuthBaseUseCase<ForgotPasswordDto, ForgotPasswordResponseDto> {
  constructor (
    private readonly authRepository: AuthRepository,
    private readonly authTokenRepository: AuthTokenRepository
  ) {
    super();
  }

  async execute ({ email }: ForgotPasswordDto): Promise<ForgotPasswordResponseDto> {
    const response = { status: true, message: 'If an account exists for this email, a password reset link has been sent.' };

    const user = await this.authRepository.findByEmail({ email });
    if (!user) return response;

    const token = await AuthTokenHelper.issue({ authTokenRepository: this.authTokenRepository, userId: user.id, purpose: AuthTokenPurpose.PASSWORD_RESET });
    const resetUrl = `${this.frontendUrl}/auth/reset-password?token=${token}`;

    await EmailHelper.emitKafkaPasswordReset({
      to: user.email,
      subject: 'Reset Your Password',
      purpose: 'Password Reset',
      title: 'Password Reset Request',
      body: `Click the link below to reset your password. This link will expire in 15 minutes.`,
      url: resetUrl,
      action: 'password_reset',
      userId: user.id,
      publishPasswordReset: this.publishPasswordReset.bind(this)
    });

    return response;
  }
}
