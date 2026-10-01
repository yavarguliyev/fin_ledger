import { Body, Controller, Delete, Get, Post, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthRateLimit, ENVIRONMENT_CONSTANTS, ParamsQueryAndHeaders, RequestContext, SessionGuard, UserRateLimit } from '@common/libs';

import { PasskeyService } from './services/passkey.service';
import { RefreshCookieInterceptor } from './interceptors/refresh-cookie.interceptor';
import { PasskeyLoginOptionsDto, PasskeyLoginOptionsSchema } from './dtos/passkeys/passkey-login-options.dto';
import { VerifyPasskeyLoginDto, VerifyPasskeyLoginSchema } from './dtos/passkeys/verify-passkey-login.dto';
import { RegisterPasskeyRequestDto, RegisterPasskeyRequestSchema } from './dtos/passkeys/register-passkey-request.dto';
import { PasskeyIdRequestDto, PasskeyIdRequestSchema } from './dtos/passkeys/passkey-id-request.dto';
import { StepUpRequestDto, StepUpRequestSchema } from './dtos/passkeys/step-up-request.dto';
import { PasskeyRegisteredDto } from './dtos/passkeys/passkey-registered.dto';
import { PasskeySummaryDto } from './dtos/passkeys/passkey-summary.dto';
import { AccountMessageResponseDto } from './dtos/response/account-message-response.dto';
import { AuthResponseDto } from './dtos/response/auth-response.dto';
import { SHARED_CONSTANTS } from '../../shared/constants/modules/shared.constant';

@ApiTags(SHARED_CONSTANTS.AUTH.key)
@Controller({ path: ENVIRONMENT_CONSTANTS.RESOURCES.AUTH, version: ENVIRONMENT_CONSTANTS.VERSION.V1 })
@UseInterceptors(RefreshCookieInterceptor)
export class AuthPasskeyController {
  constructor (private readonly passkeys: PasskeyService) {}

  @UseGuards(SessionGuard)
  @UserRateLimit()
  @Post('passkeys/register/options')
  async registerOptions (@Req() req: RequestContext): Promise<unknown> {
    return this.passkeys.registrationOptions({ userId: req.user.userId });
  }

  @UseGuards(SessionGuard)
  @UserRateLimit()
  @Post('passkeys/register/verify')
  async registerVerify (
    @Req() req: RequestContext,
    @Body({ schema: RegisterPasskeyRequestSchema }) dto: RegisterPasskeyRequestDto
  ): Promise<PasskeyRegisteredDto> {
    return this.passkeys.verifyRegistration({ ...dto, userId: req.user.userId });
  }

  @AuthRateLimit()
  @Post('passkeys/login/options')
  async loginOptions (@Body({ schema: PasskeyLoginOptionsSchema }) dto: PasskeyLoginOptionsDto): Promise<unknown> {
    return this.passkeys.loginOptions(dto);
  }

  @AuthRateLimit()
  @Post('passkeys/login/verify')
  async loginVerify (@Body({ schema: VerifyPasskeyLoginSchema }) dto: VerifyPasskeyLoginDto): Promise<AuthResponseDto> {
    return this.passkeys.verifyLogin(dto);
  }

  @UseGuards(SessionGuard)
  @UserRateLimit()
  @Post('passkeys/step-up/options')
  async stepUpOptions (@Req() req: RequestContext): Promise<unknown> {
    return this.passkeys.stepUpOptions({ userId: req.user.userId });
  }

  @UseGuards(SessionGuard)
  @UserRateLimit()
  @Post('passkeys/step-up/verify')
  async stepUpVerify (@Req() req: RequestContext, @Body({ schema: StepUpRequestSchema }) dto: StepUpRequestDto): Promise<AccountMessageResponseDto> {
    return this.passkeys.confirmStepUp({ ...dto, userId: req.user.userId });
  }

  @UseGuards(SessionGuard)
  @Get('passkeys')
  async list (@Req() req: RequestContext): Promise<PasskeySummaryDto[]> {
    return this.passkeys.list({ userId: req.user.userId });
  }

  @UseGuards(SessionGuard)
  @Delete('passkeys/:id')
  async remove (
    @Req() req: RequestContext,
    @ParamsQueryAndHeaders({ schema: PasskeyIdRequestSchema }) dto: PasskeyIdRequestDto
  ): Promise<AccountMessageResponseDto> {
    return this.passkeys.remove({ ...dto, userId: req.user.userId });
  }
}
