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
import { RegisterResponseDto } from './dtos/response/register-response.dto';
import { ForgotPasswordResponseDto } from './dtos/response/forgot-password-response.dto';
import { ResetPasswordDto } from './dtos/request/reset-password.dto';
import { AuthorizationDto } from './dtos/request/authorization.dto';
import { ForgotPasswordDto } from './dtos/request/forgot-password.dto';
import { ResetPasswordResponseDto } from './dtos/response/reset-password-response.dto';
import { SessionResponseDto } from './dtos/response/session-response.dto';
import { VerifyEmailDto } from './dtos/request/verify-email.dto';
import { GetMfaStatusUseCase } from './use-cases/queries/get-mfa-status.use-case';
import { SetupMfaUseCase } from './use-cases/commands/mfa/setup-mfa.use-case';
import { EnableMfaUseCase } from './use-cases/commands/mfa/enable-mfa.use-case';
import { DisableMfaUseCase } from './use-cases/commands/mfa/disable-mfa.use-case';
import { VerifyMfaLoginUseCase } from './use-cases/commands/mfa/verify-mfa-login.use-case';
import { VerifyMfaLoginDto } from './dtos/request/verify-mfa-login.dto';
import { LoginResponseDto } from './dtos/response/login-response.dto';
import { MfaUserDto } from './dtos/input/mfa-user.dto';
import { EnableMfaDto } from './dtos/input/enable-mfa.dto';
import { DisableMfaDto } from './dtos/input/disable-mfa.dto';
import { MfaStatusResponseDto } from './dtos/response/mfa-status-response.dto';
import { MfaEnrollmentResponseDto } from './dtos/response/mfa-enrollment-response.dto';
import { MfaRecoveryCodesResponseDto } from './dtos/response/mfa-recovery-codes-response.dto';
import { MfaDisabledResponseDto } from './dtos/response/mfa-disabled-response.dto';

@Injectable()
export class AuthService {
  constructor (
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly validateSessionUseCase: ValidateSessionUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly emailVerificationUseCase: EmailVerificationUseCase,
    private readonly getMfaStatusUseCase: GetMfaStatusUseCase,
    private readonly setupMfaUseCase: SetupMfaUseCase,
    private readonly enableMfaUseCase: EnableMfaUseCase,
    private readonly disableMfaUseCase: DisableMfaUseCase,
    private readonly verifyMfaLoginUseCase: VerifyMfaLoginUseCase
  ) {}

  async register (dto: RegisterDto): Promise<RegisterResponseDto> {
    return this.registerUserUseCase.execute(dto);
  }

  async login (dto: LoginDto): Promise<LoginResponseDto> {
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

  async getMfaStatus (dto: MfaUserDto): Promise<MfaStatusResponseDto> {
    return this.getMfaStatusUseCase.execute(dto);
  }

  async setupMfa (dto: MfaUserDto): Promise<MfaEnrollmentResponseDto> {
    return this.setupMfaUseCase.execute(dto);
  }

  async enableMfa (dto: EnableMfaDto): Promise<MfaRecoveryCodesResponseDto> {
    return this.enableMfaUseCase.execute(dto);
  }

  async disableMfa (dto: DisableMfaDto): Promise<MfaDisabledResponseDto> {
    return this.disableMfaUseCase.execute(dto);
  }

  async verifyMfaLogin (dto: VerifyMfaLoginDto): Promise<SessionResponseDto> {
    return this.verifyMfaLoginUseCase.execute(dto);
  }
}
