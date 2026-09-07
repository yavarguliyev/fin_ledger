import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ENVIRONMENT_CONSTANTS, SessionData } from '@common/libs';

import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register/register.dto';
import { LoginDto } from './dtos/login/login.dto';
import { AuthResponseDto } from './dtos/auth/auth-response.dto';
import { SHARED_CONSTANTS } from '../../shared/constants/shared.constant';
import { ForgotPasswordResponse } from './dtos/auth/forgot-password-response.dto';
import { ResetPasswordDto, ResetPasswordResponseDto } from './dtos/reset-password/reset-password.dto';
import { SessionResponseDto } from './dtos/auth/session-response.dto';
import { VerifyEmailDto } from './dtos/auth/set-password.dto';

@ApiTags(SHARED_CONSTANTS.AUTH.key)
@Controller({ path: ENVIRONMENT_CONSTANTS.RESOURCES.AUTH, version: ENVIRONMENT_CONSTANTS.VERSION.V1 })
export class AuthController {
  constructor (private readonly authService: AuthService) {}

  @Post('register')
  async register (@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(dto);
  }

  @Post('login')
  async login (@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  @Post('logout')
  async logout (@Headers('authorization') authorization?: string): Promise<void> {
    await this.authService.logout(authorization);
  }

  @Get('session')
  async getSession (@Headers('authorization') authorization?: string): Promise<SessionData> {
    return this.authService.getSession(authorization);
  }

  @Post('forgot-password')
  async forgotPassword (@Body('email') email: string): Promise<ForgotPasswordResponse> {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  async resetPassword (@Body() dto: ResetPasswordDto): Promise<ResetPasswordResponseDto> {
    return this.authService.resetPassword(dto);
  }

  @Post('verify-email')
  async verifyEmail (@Body() dto: VerifyEmailDto): Promise<SessionResponseDto> {
    return this.authService.verifyEmail(dto);
  }
}
