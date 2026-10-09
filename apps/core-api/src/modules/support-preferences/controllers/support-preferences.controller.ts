import { Body, Controller, Put, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ChatRateLimit, ENVIRONMENT_CONSTANTS, ParamsQueryAndHeaders, RequestContext, SessionGuard } from '@common/libs';

import { ConversationIdRequestDto, ConversationIdRequestSchema } from '../../support';
import { FavouriteRequestDto, FavouriteRequestSchema } from '../dtos/request/favourite-request.dto';
import { MuteRequestDto, MuteRequestSchema } from '../dtos/request/mute-request.dto';
import { PinRequestDto, PinRequestSchema } from '../dtos/request/pin-request.dto';
import { PreferencesResponseDto } from '../dtos/response/preferences-response.dto';
import { ThemeResponseDto } from '../dtos/response/theme-response.dto';
import { SHARED_CONSTANTS } from '../../../shared/constants/modules/shared.constant';
import { SUPPORT_PREFERENCES } from '../constants/support-preferences.constant';
import { SupportPreferencesService } from '../services/support-preferences.service';
import { ThemeRequestDto, ThemeRequestSchema } from '../dtos/request/theme-request.dto';

@ApiTags(SHARED_CONSTANTS.SUPPORT.key)
@UseGuards(SessionGuard)
@Controller({ path: ENVIRONMENT_CONSTANTS.RESOURCES.SUPPORT, version: ENVIRONMENT_CONSTANTS.VERSION.V1 })
export class SupportPreferencesController {
  constructor (private readonly supportPreferencesService: SupportPreferencesService) {}

  @ChatRateLimit()
  @Put(SUPPORT_PREFERENCES.ROUTES.MUTE)
  async mute (
    @Req() req: RequestContext,
    @ParamsQueryAndHeaders({ schema: ConversationIdRequestSchema }) params: ConversationIdRequestDto,
    @Body({ schema: MuteRequestSchema }) dto: MuteRequestDto
  ): Promise<PreferencesResponseDto> {
    return this.supportPreferencesService.mute({ conversationId: params.id, userId: req.user.userId, role: req.user.role ?? '', duration: dto.duration });
  }

  @ChatRateLimit()
  @Put(SUPPORT_PREFERENCES.ROUTES.PIN)
  async pin (
    @Req() req: RequestContext,
    @ParamsQueryAndHeaders({ schema: ConversationIdRequestSchema }) params: ConversationIdRequestDto,
    @Body({ schema: PinRequestSchema }) dto: PinRequestDto
  ): Promise<PreferencesResponseDto> {
    return this.supportPreferencesService.pin({ conversationId: params.id, userId: req.user.userId, role: req.user.role ?? '', pinned: dto.pinned });
  }

  @ChatRateLimit()
  @Put(SUPPORT_PREFERENCES.ROUTES.FAVOURITE)
  async favourite (
    @Req() req: RequestContext,
    @ParamsQueryAndHeaders({ schema: ConversationIdRequestSchema }) params: ConversationIdRequestDto,
    @Body({ schema: FavouriteRequestSchema }) dto: FavouriteRequestDto
  ): Promise<PreferencesResponseDto> {
    return this.supportPreferencesService.favourite({ conversationId: params.id, userId: req.user.userId, role: req.user.role ?? '', favourite: dto.favourite });
  }

  @ChatRateLimit()
  @Put(SUPPORT_PREFERENCES.ROUTES.THEME)
  async theme (
    @Req() req: RequestContext,
    @ParamsQueryAndHeaders({ schema: ConversationIdRequestSchema }) params: ConversationIdRequestDto,
    @Body({ schema: ThemeRequestSchema }) dto: ThemeRequestDto
  ): Promise<ThemeResponseDto> {
    return this.supportPreferencesService.theme({ conversationId: params.id, userId: req.user.userId, role: req.user.role ?? '', theme: dto.theme });
  }
}
