import { Body, Controller, Delete, Get, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ChatRateLimit, ENVIRONMENT_CONSTANTS, ParamsQueryAndHeaders, RequestContext, SessionGuard, SupportMessageContract } from '@common/libs';

import { ContactCardResponseDto } from '../dtos/response/contact-card-response.dto';
import { ConversationIdRequestDto, ConversationIdRequestSchema } from '../dtos/request/conversation-id-request.dto';
import { DeletedFilesResponseDto } from '../dtos/response/deleted-files-response.dto';
import { DeleteFilesRequestDto, DeleteFilesRequestSchema } from '../dtos/request/delete-files-request.dto';
import { MessageLinkDto } from '../dtos/message/message-link.dto';
import { PanelPageRequestDto, PanelPageRequestSchema } from '../dtos/request/panel-page-request.dto';
import { SHARED_CONSTANTS } from '../../../shared/constants/modules/shared.constant';
import { StorageSummaryResponseDto } from '../dtos/response/storage-summary-response.dto';
import { SUPPORT_PANEL } from '../constants/chat/support-panel.constant';
import { SupportPanelService } from '../services/support-panel.service';

@ApiTags(SHARED_CONSTANTS.SUPPORT.key)
@UseGuards(SessionGuard)
@Controller({ path: ENVIRONMENT_CONSTANTS.RESOURCES.SUPPORT, version: ENVIRONMENT_CONSTANTS.VERSION.V1 })
export class SupportPanelController {
  constructor (private readonly supportPanelService: SupportPanelService) {}

  @Get('conversations/:id/contact')
  async contact (@Req() req: RequestContext, @ParamsQueryAndHeaders({ schema: ConversationIdRequestSchema }) params: ConversationIdRequestDto): Promise<ContactCardResponseDto> {
    return this.supportPanelService.contact({ conversationId: params.id, userId: req.user.userId, role: req.user.role ?? '' });
  }

  @Get('conversations/:id/media')
  async media (@Req() req: RequestContext, @ParamsQueryAndHeaders({ schema: PanelPageRequestSchema }) { id, ...page }: PanelPageRequestDto): Promise<SupportMessageContract[]> {
    return this.supportPanelService.files({ ...page, conversationId: id, userId: req.user.userId, role: req.user.role ?? '', kinds: [...SUPPORT_PANEL.MEDIA_KINDS] });
  }

  @Get('conversations/:id/docs')
  async docs (@Req() req: RequestContext, @ParamsQueryAndHeaders({ schema: PanelPageRequestSchema }) { id, ...page }: PanelPageRequestDto): Promise<SupportMessageContract[]> {
    return this.supportPanelService.files({ ...page, conversationId: id, userId: req.user.userId, role: req.user.role ?? '', kinds: [...SUPPORT_PANEL.DOC_KINDS] });
  }

  @Get('conversations/:id/links')
  async links (@Req() req: RequestContext, @ParamsQueryAndHeaders({ schema: PanelPageRequestSchema }) { id, ...page }: PanelPageRequestDto): Promise<MessageLinkDto[]> {
    return this.supportPanelService.links({ ...page, conversationId: id, userId: req.user.userId, role: req.user.role ?? '' });
  }

  @Get('conversations/:id/storage')
  async storage (@Req() req: RequestContext, @ParamsQueryAndHeaders({ schema: ConversationIdRequestSchema }) params: ConversationIdRequestDto): Promise<StorageSummaryResponseDto> {
    return this.supportPanelService.storage({ conversationId: params.id, userId: req.user.userId, role: req.user.role ?? '' });
  }

  @ChatRateLimit()
  @Delete('conversations/:id/storage')
  async deleteFiles (
    @Req() req: RequestContext,
    @ParamsQueryAndHeaders({ schema: ConversationIdRequestSchema }) params: ConversationIdRequestDto,
    @Body({ schema: DeleteFilesRequestSchema }) dto: DeleteFilesRequestDto
  ): Promise<DeletedFilesResponseDto> {
    return this.supportPanelService.deleteFiles({ conversationId: params.id, userId: req.user.userId, role: req.user.role ?? '', messageIds: dto.messageIds });
  }
}
