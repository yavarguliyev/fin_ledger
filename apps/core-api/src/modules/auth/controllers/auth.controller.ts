import { Body, Controller, Get, Post, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthRateLimit, ENVIRONMENT_CONSTANTS, RefreshRateLimit, ParamsQueryAndHeaders, RequestContext, SessionData, SessionGuard } from '@common/libs';

import { AuthService } from '../services/auth.service';
import { RegisterDto, RegisterSchema } from '../dtos/request/register.dto';
import { LoginDto, LoginSchema } from '../dtos/request/login.dto';
import { AuthorizationDto, AuthorizationSchema } from '../dtos/request/authorization.dto';
import { LogoutRequestDto, LogoutRequestSchema } from '../dtos/request/logout-request.dto';
import { RefreshSessionDto, RefreshSessionSchema } from '../dtos/request/refresh-session.dto';
import { ChangePasswordRequestDto, ChangePasswordRequestSchema } from '../dtos/request/change-password-request.dto';
import { ChangeEmailRequestDto, ChangeEmailRequestSchema } from '../dtos/request/change-email-request.dto';
import { ConfirmEmailChangeRequestDto, ConfirmEmailChangeRequestSchema } from '../dtos/request/confirm-email-change-request.dto';
import { AccountMessageResponseDto } from '../dtos/response/account-message-response.dto';
import { ForgotPasswordDto, ForgotPasswordSchema } from '../dtos/request/forgot-password.dto';
import { ResetPasswordDto, ResetPasswordSchema } from '../dtos/request/reset-password.dto';
import { VerifyEmailDto, VerifyEmailSchema } from '../dtos/request/verify-email.dto';
import { RegisterResponseDto } from '../dtos/response/register-response.dto';
import { ForgotPasswordResponseDto } from '../dtos/response/forgot-password-response.dto';
import { ResetPasswordResponseDto } from '../dtos/response/reset-password-response.dto';
import { AuthResponseDto } from '../dtos/response/auth-response.dto';
import { LoginResponseDto } from '../dtos/response/login-response.dto';
import { RefreshCookieInterceptor } from '../interceptors/refresh-cookie.interceptor';
import { SHARED_CONSTANTS } from '../../../shared/constants/modules/shared.constant';

@ApiTags(SHARED_CONSTANTS.AUTH.key)
@Controller({ path: ENVIRONMENT_CONSTANTS.RESOURCES.AUTH, version: ENVIRONMENT_CONSTANTS.VERSION.V1 })
@UseInterceptors(RefreshCookieInterceptor)
export class AuthController {
  constructor (private readonly authService: AuthService) {}

  @AuthRateLimit()
  @Post('register')
  async register (@Body({ schema: RegisterSchema }) dto: RegisterDto): Promise<RegisterResponseDto> {
    return this.authService.register(dto);
  }

  @AuthRateLimit()
  @Post('login')
  async login (@Body({ schema: LoginSchema }) dto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(dto);
  }

  @Post('logout')
  async logout (
    @ParamsQueryAndHeaders({ schema: AuthorizationSchema }) headers: AuthorizationDto,
    @Body({ schema: LogoutRequestSchema }) dto: LogoutRequestDto
  ): Promise<void> {
    await this.authService.logout({ ...headers, ...dto });
  }

  @RefreshRateLimit()
  @Post('refresh')
  async refresh (@Body({ schema: RefreshSessionSchema }) dto: RefreshSessionDto): Promise<AuthResponseDto> {
    return this.authService.refresh(dto);
  }

  @UseGuards(SessionGuard)
  @Post('logout-all')
  async logoutEverywhere (@Req() req: RequestContext): Promise<void> {
    await this.authService.logoutEverywhere({ userId: req.user.userId });
  }

  @Get('session')
  async getSession (@ParamsQueryAndHeaders({ schema: AuthorizationSchema }) dto: AuthorizationDto): Promise<SessionData> {
    return this.authService.getSession(dto);
  }

  @AuthRateLimit()
  @Post('forgot-password')
  async forgotPassword (@Body({ schema: ForgotPasswordSchema }) dto: ForgotPasswordDto): Promise<ForgotPasswordResponseDto> {
    return this.authService.forgotPassword(dto);
  }

  @AuthRateLimit()
  @Post('reset-password')
  async resetPassword (@Body({ schema: ResetPasswordSchema }) dto: ResetPasswordDto): Promise<ResetPasswordResponseDto> {
    return this.authService.resetPassword(dto);
  }

  @AuthRateLimit()
  @Post('verify-email')
  async verifyEmail (@Body({ schema: VerifyEmailSchema }) dto: VerifyEmailDto): Promise<AuthResponseDto> {
    return this.authService.verifyEmail(dto);
  }

  @UseGuards(SessionGuard)
  @AuthRateLimit()
  @Post('change-password')
  async changePassword (
    @Req() req: RequestContext,
    @Body({ schema: ChangePasswordRequestSchema }) dto: ChangePasswordRequestDto
  ): Promise<AuthResponseDto> {
    return this.authService.changePassword({ ...dto, userId: req.user.userId });
  }

  @UseGuards(SessionGuard)
  @AuthRateLimit()
  @Post('change-email')
  async changeEmail (
    @Req() req: RequestContext,
    @Body({ schema: ChangeEmailRequestSchema }) dto: ChangeEmailRequestDto
  ): Promise<AccountMessageResponseDto> {
    return this.authService.changeEmail({ ...dto, userId: req.user.userId });
  }

  @AuthRateLimit()
  @Post('confirm-email-change')
  async confirmEmailChange (@Body({ schema: ConfirmEmailChangeRequestSchema }) dto: ConfirmEmailChangeRequestDto): Promise<AccountMessageResponseDto> {
    return this.authService.confirmEmailChange(dto);
  }
}
