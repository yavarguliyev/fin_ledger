import { Controller, Delete, Get, Put, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ChatRateLimit, ENVIRONMENT_CONSTANTS, ParamsQueryAndHeaders, RequestContext, SessionGuard } from '@common/libs';

import { ConversationIdRequestDto, ConversationIdRequestSchema } from './dtos/request/conversation-id-request.dto';
import { MessageIdRequestDto, MessageIdRequestSchema } from './dtos/request/message-id-request.dto';
import { StarredMessageDto } from './dtos/message/starred-message.dto';
import { SHARED_CONSTANTS } from '../../shared/constants/modules/shared.constant';
import { SupportStarService } from './support-star.service';

@ApiTags(SHARED_CONSTANTS.SUPPORT.key)
@UseGuards(SessionGuard)
@Controller({ path: ENVIRONMENT_CONSTANTS.RESOURCES.SUPPORT, version: ENVIRONMENT_CONSTANTS.VERSION.V1 })
export class SupportStarController {
  constructor (private readonly supportStarService: SupportStarService) {}

  @Get('conversations/:id/starred')
  async list (@Req() req: RequestContext, @ParamsQueryAndHeaders({ schema: ConversationIdRequestSchema }) params: ConversationIdRequestDto): Promise<StarredMessageDto[]> {
    return this.supportStarService.list({ conversationId: params.id, userId: req.user.userId, role: req.user.role ?? '' });
  }

  @ChatRateLimit()
  @Put('conversations/:id/messages/:messageId/star')
  async star (@Req() req: RequestContext, @ParamsQueryAndHeaders({ schema: MessageIdRequestSchema }) params: MessageIdRequestDto): Promise<StarredMessageDto[]> {
    return this.supportStarService.star({ conversationId: params.id, messageId: params.messageId, userId: req.user.userId, role: req.user.role ?? '', starred: true });
  }

  @ChatRateLimit()
  @Delete('conversations/:id/messages/:messageId/star')
  async unstar (@Req() req: RequestContext, @ParamsQueryAndHeaders({ schema: MessageIdRequestSchema }) params: MessageIdRequestDto): Promise<StarredMessageDto[]> {
    return this.supportStarService.star({ conversationId: params.id, messageId: params.messageId, userId: req.user.userId, role: req.user.role ?? '', starred: false });
  }
}
