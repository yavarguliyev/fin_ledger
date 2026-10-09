import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ChatRateLimit, ENVIRONMENT_CONSTANTS, ParamsQueryAndHeaders, RequestContext, SessionGuard } from '@common/libs';

import { ClearChatRequestDto, ClearChatRequestSchema } from '../dtos/request/clear-chat-request.dto';
import { ClearedResponseDto } from '../dtos/response/cleared-response.dto';
import { ConversationIdRequestDto, ConversationIdRequestSchema } from '../../support';
import { DeletedMessagesResponseDto } from '../dtos/response/deleted-messages-response.dto';
import { DeleteMessagesRequestDto, DeleteMessagesRequestSchema } from '../dtos/request/delete-messages-request.dto';
import { SHARED_CONSTANTS } from '../../../shared/constants/modules/shared.constant';
import { SUPPORT_HISTORY } from '../constants/support-history.constant';
import { SupportHistoryService } from '../services/support-history.service';

@ApiTags(SHARED_CONSTANTS.SUPPORT.key)
@UseGuards(SessionGuard)
@Controller({ path: ENVIRONMENT_CONSTANTS.RESOURCES.SUPPORT, version: ENVIRONMENT_CONSTANTS.VERSION.V1 })
export class SupportHistoryController {
  constructor (private readonly supportHistoryService: SupportHistoryService) {}

  @ChatRateLimit()
  @HttpCode(HttpStatus.OK)
  @Post(SUPPORT_HISTORY.ROUTES.CLEAR)
  async clear (
    @Req() req: RequestContext,
    @ParamsQueryAndHeaders({ schema: ConversationIdRequestSchema }) params: ConversationIdRequestDto,
    @Body({ schema: ClearChatRequestSchema }) dto: ClearChatRequestDto
  ): Promise<ClearedResponseDto> {
    return this.supportHistoryService.clear({ conversationId: params.id, userId: req.user.userId, role: req.user.role ?? '', keepStarred: dto.keepStarred });
  }

  @ChatRateLimit()
  @HttpCode(HttpStatus.OK)
  @Post(SUPPORT_HISTORY.ROUTES.DELETE_MANY)
  async deleteMany (
    @Req() req: RequestContext,
    @ParamsQueryAndHeaders({ schema: ConversationIdRequestSchema }) params: ConversationIdRequestDto,
    @Body({ schema: DeleteMessagesRequestSchema }) dto: DeleteMessagesRequestDto
  ): Promise<DeletedMessagesResponseDto> {
    return this.supportHistoryService.deleteMany({ conversationId: params.id, userId: req.user.userId, role: req.user.role ?? '', scope: dto.scope, messageIds: dto.messageIds });
  }
}
