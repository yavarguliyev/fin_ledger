import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ENVIRONMENT_CONSTANTS, ParamsQueryAndHeaders, RequestContext, SessionGuard, UserRateLimit } from '@common/libs';

import { AnswerCallRequestDto, AnswerCallRequestSchema } from '../dtos/request/answer-call-request.dto';
import { CallCandidateRequestDto, CallCandidateRequestSchema } from '../dtos/request/call-candidate-request.dto';
import { CallConfigResponseDto } from '../dtos/response/call-config-response.dto';
import { CallIdRequestDto, CallIdRequestSchema } from '../dtos/request/call-id-request.dto';
import { CallRenegotiateRequestDto, CallRenegotiateRequestSchema } from '../dtos/request/call-renegotiate-request.dto';
import { EndCallRequestDto, EndCallRequestSchema } from '../dtos/request/end-call-request.dto';
import { OkResponseDto } from '../dtos/response/ok-response.dto';
import { SHARED_CONSTANTS } from '../../../shared/constants/modules/shared.constant';
import { StartCallRequestDto, StartCallRequestSchema } from '../dtos/request/start-call-request.dto';
import { StartCallResponseDto } from '../dtos/response/start-call-response.dto';
import { SupportCallService } from '../services/support-call.service';

@ApiTags(SHARED_CONSTANTS.SUPPORT.key)
@UseGuards(SessionGuard)
@Controller({ path: ENVIRONMENT_CONSTANTS.RESOURCES.SUPPORT, version: ENVIRONMENT_CONSTANTS.VERSION.V1 })
export class SupportCallController {
  constructor (private readonly callService: SupportCallService) {}

  @Get('calls/config')
  getCallConfig (): CallConfigResponseDto {
    return this.callService.getCallConfig();
  }

  @UserRateLimit()
  @Post('calls')
  async startCall (@Req() req: RequestContext, @Body({ schema: StartCallRequestSchema }) dto: StartCallRequestDto): Promise<StartCallResponseDto> {
    return this.callService.startCall({ ...dto, userId: req.user.userId, role: req.user.role ?? '', displayName: req.user.displayName });
  }

  @Post('calls/:callId/answer')
  async answerCall (
    @Req() req: RequestContext,
    @ParamsQueryAndHeaders({ schema: CallIdRequestSchema }) params: CallIdRequestDto,
    @Body({ schema: AnswerCallRequestSchema }) dto: AnswerCallRequestDto
  ): Promise<OkResponseDto> {
    return this.callService.answerCall({ ...dto, callId: params.callId, userId: req.user.userId, role: req.user.role ?? '' });
  }

  @Post('calls/:callId/candidates')
  async relayCandidate (
    @Req() req: RequestContext,
    @ParamsQueryAndHeaders({ schema: CallIdRequestSchema }) params: CallIdRequestDto,
    @Body({ schema: CallCandidateRequestSchema }) dto: CallCandidateRequestDto
  ): Promise<OkResponseDto> {
    return this.callService.relayCallCandidate({ ...dto, callId: params.callId, userId: req.user.userId, role: req.user.role ?? '' });
  }

  @Post('calls/:callId/renegotiate')
  async renegotiate (
    @Req() req: RequestContext,
    @ParamsQueryAndHeaders({ schema: CallIdRequestSchema }) params: CallIdRequestDto,
    @Body({ schema: CallRenegotiateRequestSchema }) dto: CallRenegotiateRequestDto
  ): Promise<OkResponseDto> {
    return this.callService.relayCallRenegotiation({ ...dto, callId: params.callId, userId: req.user.userId });
  }

  @Post('calls/:callId/end')
  async endCall (
    @Req() req: RequestContext,
    @ParamsQueryAndHeaders({ schema: CallIdRequestSchema }) params: CallIdRequestDto,
    @Body({ schema: EndCallRequestSchema }) dto: EndCallRequestDto
  ): Promise<OkResponseDto> {
    return this.callService.endCall({ ...dto, callId: params.callId, userId: req.user.userId, role: req.user.role ?? '' });
  }
}
