import { Controller, Get, Patch, Post, Req, Sse, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { ENVIRONMENT_CONSTANTS, ParamsQueryAndHeaders, RequestContext, SessionGuard, StreamTicketGuard } from '@common/libs';

import { NotificationService } from '../services/notification.service';
import { NotificationDto } from '../dtos/notification/notification.dto';
import { NotificationPageItemDto } from '../dtos/response/notification-page-item.dto';
import { ListNotificationsRequestDto, ListNotificationsRequestSchema } from '../dtos/request/list-notifications-request.dto';
import { MarkNotificationReadRequestDto, MarkNotificationReadRequestSchema } from '../dtos/request/mark-notification-read-request.dto';
import { StreamTicketResponseDto } from '../dtos/response/stream-ticket-response.dto';
import { SHARED_CONSTANTS } from '../../../shared/constants/modules/shared.constant';

@ApiTags(SHARED_CONSTANTS.NOTIFICATION.key)
@Controller({ path: ENVIRONMENT_CONSTANTS.RESOURCES.NOTIFICATION, version: ENVIRONMENT_CONSTANTS.VERSION.V1 })
export class NotificationController {
  constructor (private readonly notificationService: NotificationService) {}

  @UseGuards(SessionGuard)
  @Get()
  async getNotifications (
    @Req() req: RequestContext,
    @ParamsQueryAndHeaders({ schema: ListNotificationsRequestSchema }) dto: ListNotificationsRequestDto
  ): Promise<NotificationPageItemDto[]> {
    return this.notificationService.getNotifications({ ...dto, userId: req.user.userId });
  }

  @UseGuards(SessionGuard)
  @Patch(':id/read')
  async markNotificationAsRead (
    @Req() req: RequestContext,
    @ParamsQueryAndHeaders({ schema: MarkNotificationReadRequestSchema }) dto: MarkNotificationReadRequestDto
  ): Promise<NotificationDto> {
    return this.notificationService.markAsRead({ ...dto, userId: req.user.userId });
  }

  @UseGuards(SessionGuard)
  @Post('stream-ticket')
  async issueStreamTicket (@Req() req: RequestContext): Promise<StreamTicketResponseDto> {
    return this.notificationService.issueStreamTicket({ session: req.user });
  }

  @UseGuards(StreamTicketGuard)
  @Sse('stream')
  streamNotifications (@Req() req: RequestContext): Observable<MessageEvent> {
    return this.notificationService.getEventStream({ userId: req.user.userId });
  }
}
