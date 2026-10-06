import { Controller, Delete, Get, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ChatRateLimit, ENVIRONMENT_CONSTANTS, ParamsQueryAndHeaders, RequestContext, SessionGuard } from '@common/libs';

import { ConversationIdRequestDto, ConversationIdRequestSchema } from '../dtos/request/conversation-id-request.dto';
import { LockResponseDto } from '../dtos/response/lock-response.dto';
import { SHARED_CONSTANTS } from '../../../shared/constants/modules/shared.constant';
import { SupportLockService } from '../services/support-lock.service';

@ApiTags(SHARED_CONSTANTS.SUPPORT.key)
@UseGuards(SessionGuard)
@Controller({ path: ENVIRONMENT_CONSTANTS.RESOURCES.SUPPORT, version: ENVIRONMENT_CONSTANTS.VERSION.V1 })
export class SupportLockController {
  constructor (private readonly supportLockService: SupportLockService) {}

  @Get('conversations/:id/lock')
  async state (@Req() req: RequestContext, @ParamsQueryAndHeaders({ schema: ConversationIdRequestSchema }) params: ConversationIdRequestDto): Promise<LockResponseDto> {
    return this.supportLockService.state({ conversationId: params.id, userId: req.user.userId, role: req.user.role ?? '' });
  }

  @ChatRateLimit()
  @Delete('conversations/:id/lock')
  async remove (@Req() req: RequestContext, @ParamsQueryAndHeaders({ schema: ConversationIdRequestSchema }) params: ConversationIdRequestDto): Promise<LockResponseDto> {
    return this.supportLockService.remove({ conversationId: params.id, userId: req.user.userId, role: req.user.role ?? '' });
  }
}
