import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ENVIRONMENT_CONSTANTS, ParamsQueryAndHeaders, SessionData } from '@common/libs';

import { AuthService } from './auth.service';
import { RegisterDto, RegisterSchema } from './dtos/request/register.dto';
import { LoginDto, LoginSchema } from './dtos/request/login.dto';
import { AuthorizationDto, AuthorizationSchema } from './dtos/request/authorization.dto';
import { ForgotPasswordDto, ForgotPasswordSchema } from './dtos/request/forgot-password.dto';
import { ResetPasswordDto, ResetPasswordSchema } from './dtos/request/reset-password.dto';
import { VerifyEmailDto, VerifyEmailSchema } from './dtos/request/verify-email.dto';
import { AuthResponseDto } from './dtos/response/auth-response.dto';
import { ForgotPasswordResponseDto } from './dtos/response/forgot-password-response.dto';
import { ResetPasswordResponseDto } from './dtos/response/reset-password-response.dto';
import { SessionResponseDto } from './dtos/response/session-response.dto';
import { SHARED_CONSTANTS } from '../../shared/constants/shared.constant';

@ApiTags(SHARED_CONSTANTS.AUTH.key)
@Controller({ path: ENVIRONMENT_CONSTANTS.RESOURCES.AUTH, version: ENVIRONMENT_CONSTANTS.VERSION.V1 })
export class AuthController {
  constructor (private readonly authService: AuthService) {}

  @Post('register')
  async register (@Body({ schema: RegisterSchema }) dto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(dto);
  }

  @Post('login')
  async login (@Body({ schema: LoginSchema }) dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  @Post('logout')
  async logout (@ParamsQueryAndHeaders({ schema: AuthorizationSchema }) dto: AuthorizationDto): Promise<void> {
    await this.authService.logout(dto);
  }

  @Get('session')
  async getSession (@ParamsQueryAndHeaders({ schema: AuthorizationSchema }) dto: AuthorizationDto): Promise<SessionData> {
    return this.authService.getSession(dto);
  }

  @Post('forgot-password')
  async forgotPassword (@Body({ schema: ForgotPasswordSchema }) dto: ForgotPasswordDto): Promise<ForgotPasswordResponseDto> {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  async resetPassword (@Body({ schema: ResetPasswordSchema }) dto: ResetPasswordDto): Promise<ResetPasswordResponseDto> {
    return this.authService.resetPassword(dto);
  }

  @Post('verify-email')
  async verifyEmail (@Body({ schema: VerifyEmailSchema }) dto: VerifyEmailDto): Promise<SessionResponseDto> {
    return this.authService.verifyEmail(dto);
  }
}
