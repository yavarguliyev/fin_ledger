import { Body, Controller, Delete, Put, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ChatRateLimit, ENVIRONMENT_CONSTANTS, ParamsQueryAndHeaders, RequestContext, SessionGuard } from '@common/libs';

import { MessageIdRequestDto, MessageIdRequestSchema } from './dtos/request/message-id-request.dto';
import { ReactionDto } from './dtos/message/reaction.dto';
import { ReactionRequestDto, ReactionRequestSchema } from './dtos/request/reaction-request.dto';
import { SHARED_CONSTANTS } from '../../shared/constants/modules/shared.constant';
import { SupportService } from './support.service';

@ApiTags(SHARED_CONSTANTS.SUPPORT.key)
@UseGuards(SessionGuard)
@Controller({ path: ENVIRONMENT_CONSTANTS.RESOURCES.SUPPORT, version: ENVIRONMENT_CONSTANTS.VERSION.V1 })
export class SupportReactionController {
  constructor (private readonly supportService: SupportService) {}

  @ChatRateLimit()
  @Put('conversations/:id/messages/:messageId/reaction')
  async react (
    @Req() req: RequestContext,
    @ParamsQueryAndHeaders({ schema: MessageIdRequestSchema }) params: MessageIdRequestDto,
    @Body({ schema: ReactionRequestSchema }) dto: ReactionRequestDto
  ): Promise<ReactionDto[]> {
    return this.supportService.react({ conversationId: params.id, messageId: params.messageId, userId: req.user.userId, role: req.user.role ?? '', emoji: dto.emoji });
  }

  @ChatRateLimit()
  @Delete('conversations/:id/messages/:messageId/reaction')
  async unreact (@Req() req: RequestContext, @ParamsQueryAndHeaders({ schema: MessageIdRequestSchema }) params: MessageIdRequestDto): Promise<ReactionDto[]> {
    return this.supportService.react({ conversationId: params.id, messageId: params.messageId, userId: req.user.userId, role: req.user.role ?? '', emoji: null });
  }
}
