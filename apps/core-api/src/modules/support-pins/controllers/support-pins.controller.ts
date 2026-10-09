import { Body, Controller, Delete, Get, Put, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ChatRateLimit, ENVIRONMENT_CONSTANTS, ParamsQueryAndHeaders, RequestContext, SessionGuard, SupportMessageContract } from '@common/libs';

import { ConversationIdRequestDto, ConversationIdRequestSchema, MessageIdRequestDto, MessageIdRequestSchema } from '../../support';
import { PinMessageRequestDto, PinMessageRequestSchema } from '../dtos/request/pin-message-request.dto';
import { SHARED_CONSTANTS } from '../../../shared/constants/modules/shared.constant';
import { SUPPORT_PINS } from '../constants/support-pins.constant';
import { SupportPinsService } from '../services/support-pins.service';

@ApiTags(SHARED_CONSTANTS.SUPPORT.key)
@UseGuards(SessionGuard)
@Controller({ path: ENVIRONMENT_CONSTANTS.RESOURCES.SUPPORT, version: ENVIRONMENT_CONSTANTS.VERSION.V1 })
export class SupportPinsController {
  constructor (private readonly supportPinsService: SupportPinsService) {}

  @Get(SUPPORT_PINS.ROUTES.LIST)
  async list (@Req() req: RequestContext, @ParamsQueryAndHeaders({ schema: ConversationIdRequestSchema }) params: ConversationIdRequestDto): Promise<SupportMessageContract[]> {
    return this.supportPinsService.list({ conversationId: params.id, userId: req.user.userId, role: req.user.role ?? '' });
  }

  @ChatRateLimit()
  @Put(SUPPORT_PINS.ROUTES.PIN)
  async pin (
    @Req() req: RequestContext,
    @ParamsQueryAndHeaders({ schema: MessageIdRequestSchema }) params: MessageIdRequestDto,
    @Body({ schema: PinMessageRequestSchema }) dto: PinMessageRequestDto
  ): Promise<SupportMessageContract[]> {
    return this.supportPinsService.pin({ conversationId: params.id, messageId: params.messageId, userId: req.user.userId, role: req.user.role ?? '', duration: dto.duration });
  }

  @ChatRateLimit()
  @Delete(SUPPORT_PINS.ROUTES.PIN)
  async unpin (@Req() req: RequestContext, @ParamsQueryAndHeaders({ schema: MessageIdRequestSchema }) params: MessageIdRequestDto): Promise<SupportMessageContract[]> {
    return this.supportPinsService.unpin({ conversationId: params.id, messageId: params.messageId, userId: req.user.userId, role: req.user.role ?? '' });
  }
}
