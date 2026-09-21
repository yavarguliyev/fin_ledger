import { Injectable } from '@nestjs/common';
import { SessionData } from '@common/libs';

import { RegisterUserUseCase } from './use-cases/commands/register-user.use-case';
import { LoginUseCase } from './use-cases/commands/login.use-case';
import { ValidateSessionUseCase } from './use-cases/commands/validate-session.use-case';
import { LogoutUseCase } from './use-cases/commands/logout.use-case';
import { ForgotPasswordUseCase } from './use-cases/commands/forgot-password.use-case';
import { ResetPasswordUseCase } from './use-cases/commands/reset-password.use-case';
import { EmailVerificationUseCase } from './use-cases/commands/email-verification.use-case';
import { RegisterDto } from './dtos/request/register.dto';
import { LoginDto } from './dtos/request/login.dto';
import { AuthResponseDto } from './dtos/response/auth-response.dto';
import { ForgotPasswordResponseDto } from './dtos/response/forgot-password-response.dto';
import { ResetPasswordDto } from './dtos/request/reset-password.dto';
import { AuthorizationDto } from './dtos/request/authorization.dto';
import { ForgotPasswordDto } from './dtos/request/forgot-password.dto';
import { ResetPasswordResponseDto } from './dtos/response/reset-password-response.dto';
import { SessionResponseDto } from './dtos/response/session-response.dto';
import { VerifyEmailDto } from './dtos/request/verify-email.dto';

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

  async logout (dto: AuthorizationDto): Promise<void> {
    await this.logoutUseCase.execute(dto);
  }

  async getSession (dto: AuthorizationDto): Promise<SessionData> {
    return this.validateSessionUseCase.execute(dto);
  }

  async forgotPassword (dto: ForgotPasswordDto): Promise<ForgotPasswordResponseDto> {
    return this.forgotPasswordUseCase.execute(dto);
  }

  async resetPassword (dto: ResetPasswordDto): Promise<ResetPasswordResponseDto> {
    return this.resetPasswordUseCase.execute(dto);
  }

  async verifyEmail (dto: VerifyEmailDto): Promise<SessionResponseDto> {
    return this.emailVerificationUseCase.execute(dto);
  }
}
