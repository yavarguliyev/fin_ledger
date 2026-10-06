import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Audited, ChatRateLimit, ENVIRONMENT_CONSTANTS, ParamsQueryAndHeaders, RequestContext, SessionGuard } from '@common/libs';

import { ConversationIdRequestDto, ConversationIdRequestSchema } from '../dtos/request/conversation-id-request.dto';
import { DownloadUrlResponseDto } from '../dtos/response/download-url-response.dto';
import { MessageIdRequestDto, MessageIdRequestSchema } from '../dtos/request/message-id-request.dto';
import { PrivacyRequestDto, PrivacyRequestSchema } from '../dtos/request/privacy-request.dto';
import { PrivacyResponseDto } from '../dtos/response/privacy-response.dto';
import { SHARED_CONSTANTS } from '../../../shared/constants/modules/shared.constant';
import { SUPPORT_PRIVACY } from '../constants/chat/support-privacy.constant';
import { SupportPrivacyService } from '../services/support-privacy.service';

@ApiTags(SHARED_CONSTANTS.SUPPORT.key)
@UseGuards(SessionGuard)
@Controller({ path: ENVIRONMENT_CONSTANTS.RESOURCES.SUPPORT, version: ENVIRONMENT_CONSTANTS.VERSION.V1 })
export class SupportPrivacyController {
  constructor (private readonly supportPrivacyService: SupportPrivacyService) {}

  @ChatRateLimit()
  @Put('conversations/:id/privacy')
  @Audited({ action: SUPPORT_PRIVACY.AUDIT_ACTION, entityType: SUPPORT_PRIVACY.AUDIT_ENTITY_TYPE, entityIdParam: SUPPORT_PRIVACY.AUDIT_ENTITY_ID_PARAM })
  async change (
    @Req() req: RequestContext,
    @ParamsQueryAndHeaders({ schema: ConversationIdRequestSchema }) params: ConversationIdRequestDto,
    @Body({ schema: PrivacyRequestSchema }) dto: PrivacyRequestDto
  ): Promise<PrivacyResponseDto> {
    return this.supportPrivacyService.change({ conversationId: params.id, userId: req.user.userId, role: req.user.role ?? '', enabled: dto.enabled });
  }

  @Get('conversations/:id/messages/:messageId/download')
  async download (@Req() req: RequestContext, @ParamsQueryAndHeaders({ schema: MessageIdRequestSchema }) params: MessageIdRequestDto): Promise<DownloadUrlResponseDto> {
    return this.supportPrivacyService.download({ conversationId: params.id, messageId: params.messageId, userId: req.user.userId, role: req.user.role ?? '' });
  }
}
