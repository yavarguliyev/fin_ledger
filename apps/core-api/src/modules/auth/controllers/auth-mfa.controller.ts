import { Body, Controller, Get, Post, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthRateLimit, ENVIRONMENT_CONSTANTS, RequestContext, SessionGuard, UserRateLimit } from '@common/libs';

import { AuthService } from '../services/auth.service';
import { RefreshCookieInterceptor } from '../interceptors/refresh-cookie.interceptor';
import { MfaCodeDto, MfaCodeSchema } from '../dtos/request/mfa-code.dto';
import { VerifyMfaLoginDto, VerifyMfaLoginSchema } from '../dtos/request/verify-mfa-login.dto';
import { DisableMfaRequestDto, DisableMfaRequestSchema } from '../dtos/request/disable-mfa-request.dto';
import { MfaStatusResponseDto } from '../dtos/response/mfa-status-response.dto';
import { MfaEnrollmentResponseDto } from '../dtos/response/mfa-enrollment-response.dto';
import { MfaRecoveryCodesResponseDto } from '../dtos/response/mfa-recovery-codes-response.dto';
import { MfaDisabledResponseDto } from '../dtos/response/mfa-disabled-response.dto';
import { AuthResponseDto } from '../dtos/response/auth-response.dto';
import { SHARED_CONSTANTS } from '../../../shared/constants/modules/shared.constant';

@ApiTags(SHARED_CONSTANTS.AUTH.key)
@Controller({ path: ENVIRONMENT_CONSTANTS.RESOURCES.AUTH, version: ENVIRONMENT_CONSTANTS.VERSION.V1 })
@UseInterceptors(RefreshCookieInterceptor)
export class AuthMfaController {
  constructor (private readonly authService: AuthService) {}

  @UseGuards(SessionGuard)
  @Get('mfa/status')
  async getMfaStatus (@Req() req: RequestContext): Promise<MfaStatusResponseDto> {
    return this.authService.getMfaStatus({ userId: req.user.userId });
  }

  @UseGuards(SessionGuard)
  @Post('mfa/setup')
  async setupMfa (@Req() req: RequestContext): Promise<MfaEnrollmentResponseDto> {
    return this.authService.setupMfa({ userId: req.user.userId });
  }

  @UseGuards(SessionGuard)
  @UserRateLimit()
  @Post('mfa/enable')
  async enableMfa (@Req() req: RequestContext, @Body({ schema: MfaCodeSchema }) dto: MfaCodeDto): Promise<MfaRecoveryCodesResponseDto> {
    return this.authService.enableMfa({ ...dto, userId: req.user.userId });
  }

  @UseGuards(SessionGuard)
  @UserRateLimit()
  @Post('mfa/disable')
  async disableMfa (
    @Req() req: RequestContext,
    @Body({ schema: DisableMfaRequestSchema }) dto: DisableMfaRequestDto
  ): Promise<MfaDisabledResponseDto> {
    return this.authService.disableMfa({ ...dto, userId: req.user.userId });
  }

  @UseGuards(SessionGuard)
  @UserRateLimit()
  @Post('mfa/recovery-codes')
  async regenerateRecoveryCodes (
    @Req() req: RequestContext,
    @Body({ schema: DisableMfaRequestSchema }) dto: DisableMfaRequestDto
  ): Promise<MfaRecoveryCodesResponseDto> {
    return this.authService.regenerateRecoveryCodes({ ...dto, userId: req.user.userId });
  }

  @AuthRateLimit()
  @Post('mfa/verify')
  async verifyMfaLogin (@Body({ schema: VerifyMfaLoginSchema }) dto: VerifyMfaLoginDto): Promise<AuthResponseDto> {
    return this.authService.verifyMfaLogin(dto);
  }
}
