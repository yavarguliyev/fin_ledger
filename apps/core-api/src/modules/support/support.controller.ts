import { Body, Controller, Get, Post, Req, Sse, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import {
  ENVIRONMENT_CONSTANTS,
  ParamsQueryAndHeaders,
  RequestContext,
  SessionGuard,
  StreamTicketGuard,
  UserRateLimit
} from '@common/libs';

import { ListConversationsRequestDto, ListConversationsRequestSchema } from './dtos/request/list-conversations-request.dto';
import { OpenConversationRequestDto, OpenConversationRequestSchema } from './dtos/request/open-conversation-request.dto';
import { SHARED_CONSTANTS } from '../../shared/constants/modules/shared.constant';
import { SupportConversationContract } from '@common/contracts';
import { SupportService } from './support.service';
import { LastSeenRequestDto, LastSeenRequestSchema } from './dtos/request/last-seen-request.dto';
import { LastSeenResponseDto } from './dtos/response/last-seen-response.dto';
import { PresenceEntryDto } from './dtos/presence/presence-entry.dto';
import { OkResponseDto } from './dtos/response/ok-response.dto';
import { StreamTicketResponseDto } from './dtos/response/stream-ticket-response.dto';
import { PresenceCountDto } from './dtos/presence/presence-count.dto';

@ApiTags(SHARED_CONSTANTS.SUPPORT.key)
@Controller({ path: ENVIRONMENT_CONSTANTS.RESOURCES.SUPPORT, version: ENVIRONMENT_CONSTANTS.VERSION.V1 })
export class SupportController {
  constructor (private readonly supportService: SupportService) {}

  @UseGuards(SessionGuard)
  @UserRateLimit()
  @Post('conversations')
  async openConversation (
    @Req() req: RequestContext,
    @Body({ schema: OpenConversationRequestSchema }) dto: OpenConversationRequestDto
  ): Promise<SupportConversationContract> {
    return this.supportService.openConversation({ ...dto, userId: req.user.userId, role: req.user.role ?? '' });
  }

  @UseGuards(SessionGuard)
  @Get('conversations')
  async listConversations (
    @Req() req: RequestContext,
    @ParamsQueryAndHeaders({ schema: ListConversationsRequestSchema }) dto: ListConversationsRequestDto
  ): Promise<SupportConversationContract[]> {
    return this.supportService.listConversations({ ...dto, actorId: req.user.userId, role: req.user.role ?? '' });
  }

  @UseGuards(SessionGuard)
  @Post('presence/heartbeat')
  async heartbeat (@Req() req: RequestContext): Promise<OkResponseDto> {
    return this.supportService.heartbeat({ userId: req.user.userId, displayName: req.user.displayName, role: req.user.role ?? '' });
  }

  @UseGuards(SessionGuard)
  @Post('presence/leave')
  async leavePresence (@Req() req: RequestContext): Promise<OkResponseDto> {
    return this.supportService.leavePresence({ userId: req.user.userId });
  }

  @UseGuards(SessionGuard)
  @Get('presence/last-seen')
  async lastSeen (
    @Req() req: RequestContext,
    @ParamsQueryAndHeaders({ schema: LastSeenRequestSchema }) dto: LastSeenRequestDto
  ): Promise<LastSeenResponseDto> {
    return this.supportService.lastSeen({ targetUserId: dto.userId, role: req.user.role ?? '' });
  }

  @UseGuards(SessionGuard)
  @Get('contacts')
  async listContacts (@Req() req: RequestContext): Promise<PresenceEntryDto[]> {
    return this.supportService.listContacts({ actorId: req.user.userId, role: req.user.role ?? '' });
  }

  @UseGuards(SessionGuard)
  @Get('presence/count')
  async countPresence (@Req() req: RequestContext): Promise<PresenceCountDto> {
    return this.supportService.countPresence({ actorId: req.user.userId, role: req.user.role ?? '' });
  }

  @UseGuards(SessionGuard)
  @Get('presence')
  async listPresence (@Req() req: RequestContext): Promise<PresenceEntryDto[]> {
    return this.supportService.listPresence({ actorId: req.user.userId, role: req.user.role ?? '' });
  }

  @UseGuards(SessionGuard)
  @Post('stream-ticket')
  async issueStreamTicket (@Req() req: RequestContext): Promise<StreamTicketResponseDto> {
    return this.supportService.issueStreamTicket({ session: req.user });
  }

  @UseGuards(StreamTicketGuard)
  @Sse('stream')
  streamSupport (@Req() req: RequestContext): Observable<MessageEvent> {
    return this.supportService.streamEvents({ userId: req.user.userId, role: req.user.role ?? '' });
  }
}
