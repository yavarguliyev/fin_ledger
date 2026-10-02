import { Body, Controller, Delete, Get, Patch, Post, Req, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import {
  ENVIRONMENT_CONSTANTS,
  ParamsQueryAndHeaders,
  RequestContext,
  SessionGuard,
  UploadFile,
  UserRateLimit, ChatRateLimit,
  SupportMessageContract
} from '@common/libs';

import { AttachmentCaptionRequestDto, AttachmentCaptionRequestSchema } from './dtos/request/attachment-caption-request.dto';
import { ConversationIdRequestDto, ConversationIdRequestSchema } from './dtos/request/conversation-id-request.dto';
import { ListMessagesRequestDto, ListMessagesRequestSchema } from './dtos/request/list-messages-request.dto';
import { DeleteMessageRequestDto, DeleteMessageRequestSchema } from './dtos/request/delete-message-request.dto';
import { MessageIdRequestDto, MessageIdRequestSchema } from './dtos/request/message-id-request.dto';
import { OkResponseDto } from './dtos/response/ok-response.dto';
import { SendMessageRequestDto, SendMessageRequestSchema } from './dtos/request/send-message-request.dto';
import { SHARED_CONSTANTS } from '../../shared/constants/modules/shared.constant';
import { SUPPORT_ATTACHMENT } from './constants/attachment/support-attachment.constant';
import { SupportService } from './support.service';
import { SearchMessagesRequestDto, SearchMessagesRequestSchema } from './dtos/request/search-messages-request.dto';
import { MessageHitResponseDto } from './dtos/response/message-hit-response.dto';

@ApiTags(SHARED_CONSTANTS.SUPPORT.key)
@Controller({ path: ENVIRONMENT_CONSTANTS.RESOURCES.SUPPORT, version: ENVIRONMENT_CONSTANTS.VERSION.V1 })
export class SupportMessageController {
  constructor (private readonly supportService: SupportService) {}

  @UseGuards(SessionGuard)
  @Get('conversations/:id/messages/search')
  async searchMessages (
    @Req() req: RequestContext,
    @ParamsQueryAndHeaders({ schema: SearchMessagesRequestSchema }) dto: SearchMessagesRequestDto
  ): Promise<MessageHitResponseDto[]> {
    return this.supportService.searchMessages({ ...dto, actorId: req.user.userId, role: req.user.role ?? '' });
  }

  @UseGuards(SessionGuard)
  @Get('conversations/:id/messages')
  async listMessages (
    @Req() req: RequestContext,
    @ParamsQueryAndHeaders({ schema: ListMessagesRequestSchema }) dto: ListMessagesRequestDto
  ): Promise<SupportMessageContract[]> {
    return this.supportService.listMessages({ ...dto, actorId: req.user.userId, role: req.user.role ?? '' });
  }

  @UseGuards(SessionGuard)
  @UserRateLimit()
  @ChatRateLimit()
  @Post('conversations/:id/messages')
  async sendMessage (
    @Req() req: RequestContext,
    @ParamsQueryAndHeaders({ schema: ConversationIdRequestSchema }) params: ConversationIdRequestDto,
    @Body({ schema: SendMessageRequestSchema }) dto: SendMessageRequestDto
  ): Promise<SupportMessageContract> {
    return this.supportService.sendMessage({
      conversationId: params.id,
      senderUserId: req.user.userId,
      role: req.user.role ?? '',
      body: dto.body,
      ...(dto.replyToMessageId && { replyToMessageId: dto.replyToMessageId })
    });
  }

  @UseGuards(SessionGuard)
  @Post('conversations/:id/read')
  async markRead (
    @Req() req: RequestContext,
    @ParamsQueryAndHeaders({ schema: ConversationIdRequestSchema }) params: ConversationIdRequestDto
  ): Promise<OkResponseDto> {
    return this.supportService.markRead({ conversationId: params.id, userId: req.user.userId, role: req.user.role ?? '' });
  }

  @ChatRateLimit()
  @UseGuards(SessionGuard)
  @Post('conversations/:id/typing')
  async announceTyping (
    @Req() req: RequestContext,
    @ParamsQueryAndHeaders({ schema: ConversationIdRequestSchema }) params: ConversationIdRequestDto
  ): Promise<OkResponseDto> {
    return this.supportService.announceTyping({ conversationId: params.id, userId: req.user.userId, role: req.user.role ?? '' });
  }

  @UseGuards(SessionGuard)
  @UserRateLimit()
  @Post('conversations/:id/attachments')
  @UseInterceptors(
    FilesInterceptor(SUPPORT_ATTACHMENT.FIELD_NAME, SUPPORT_ATTACHMENT.MAX_FILES, {
      limits: { fileSize: SUPPORT_ATTACHMENT.MAX_FILE_SIZE_BYTES, files: SUPPORT_ATTACHMENT.MAX_FILES }
    })
  )
  async sendAttachments (
    @Req() req: RequestContext,
    @ParamsQueryAndHeaders({ schema: ConversationIdRequestSchema }) params: ConversationIdRequestDto,
    @Body({ schema: AttachmentCaptionRequestSchema }) dto: AttachmentCaptionRequestDto,
    @UploadedFiles() files: UploadFile[] | undefined
  ): Promise<SupportMessageContract[]> {
    return this.supportService.sendAttachments({
      ...dto,
      conversationId: params.id,
      senderUserId: req.user.userId,
      role: req.user.role ?? '',
      files: files ?? []
    });
  }

  @UseGuards(SessionGuard)
  @UserRateLimit()
  @Patch('conversations/:id/messages/:messageId')
  @UseInterceptors(
    FileInterceptor(SUPPORT_ATTACHMENT.EDIT_FIELD_NAME, {
      limits: { fileSize: SUPPORT_ATTACHMENT.MAX_FILE_SIZE_BYTES, files: SUPPORT_ATTACHMENT.SINGLE_FILE }
    })
  )
  async editMessage (
    @Req() req: RequestContext,
    @ParamsQueryAndHeaders({ schema: MessageIdRequestSchema }) params: MessageIdRequestDto,
    @Body({ schema: AttachmentCaptionRequestSchema }) dto: AttachmentCaptionRequestDto,
    @UploadedFile() file: UploadFile | undefined
  ): Promise<SupportMessageContract> {
    return this.supportService.editMessage({
      ...dto,
      conversationId: params.id,
      messageId: params.messageId,
      userId: req.user.userId,
      role: req.user.role ?? '',
      ...(file && { file })
    });
  }

  @UseGuards(SessionGuard)
  @UserRateLimit()
  @Delete('conversations/:id/messages/:messageId')
  async deleteMessage (
    @Req() req: RequestContext,
    @ParamsQueryAndHeaders({ schema: DeleteMessageRequestSchema }) params: DeleteMessageRequestDto
  ): Promise<OkResponseDto> {
    return this.supportService.deleteMessage({
      conversationId: params.id,
      messageId: params.messageId,
      userId: req.user.userId,
      role: req.user.role ?? '',
      scope: params.scope
    });
  }
}
