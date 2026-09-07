import { Injectable } from '@nestjs/common';
import { SessionData } from '@common/libs';

import { RegisterUserUseCase } from './use-cases/commands/register-user.use-case';
import { LoginUseCase } from './use-cases/commands/login.use-case';
import { ValidateSessionUseCase } from './use-cases/commands/validate-session.use-case';
import { LogoutUseCase } from './use-cases/commands/logout.use-case';
import { ForgotPasswordUseCase } from './use-cases/commands/forgot-password.use-case';
import { ResetPasswordUseCase } from './use-cases/commands/reset-password.use-case';
import { EmailVerificationUseCase } from './use-cases/commands/email-verification.use-case';
import { RegisterDto } from './dtos/register/register.dto';
import { LoginDto } from './dtos/login/login.dto';
import { AuthResponseDto } from './dtos/auth/auth-response.dto';
import { ForgotPasswordResponse } from './dtos/auth/forgot-password-response.dto';
import { ResetPasswordDto, ResetPasswordResponseDto } from './dtos/reset-password/reset-password.dto';
import { SessionResponseDto } from './dtos/auth/session-response.dto';
import { VerifyEmailDto } from './dtos/auth/set-password.dto';

@Injectable()
export class AuthService {
  constructor (
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly validateSessionUseCase: ValidateSessionUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly emailVerificationUseCase: EmailVerificationUseCase
  ) {}

  async register (dto: RegisterDto): Promise<AuthResponseDto> {
    return this.registerUserUseCase.execute(dto);
  }

  async login (dto: LoginDto): Promise<AuthResponseDto> {
    return this.loginUseCase.execute(dto);
  }

  async logout (authorization?: string): Promise<void> {
    await this.logoutUseCase.execute(authorization);
  }

  async getSession (authorization?: string): Promise<SessionData> {
    return this.validateSessionUseCase.execute(authorization);
  }

  async forgotPassword (email: string): Promise<ForgotPasswordResponse> {
    return this.forgotPasswordUseCase.execute(email);
  }

  async resetPassword (dto: ResetPasswordDto): Promise<ResetPasswordResponseDto> {
    return this.resetPasswordUseCase.execute(dto);
  }

  async verifyEmail (dto: VerifyEmailDto): Promise<SessionResponseDto> {
    return this.emailVerificationUseCase.execute(dto);
  }
}
