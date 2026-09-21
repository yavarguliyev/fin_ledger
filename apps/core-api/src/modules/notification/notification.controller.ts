import { Controller, Get, Patch, Req, Sse, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Observable, map } from 'rxjs';
import { ENVIRONMENT_CONSTANTS, ParamsQueryAndHeaders, RequestContext, SessionGuard } from '@common/libs';

import { NotificationService } from './notification.service';
import { NotificationDto } from './dtos/notification/notification.dto';
import { ListNotificationsRequestDto, ListNotificationsRequestSchema } from './dtos/request/list-notifications-request.dto';
import { MarkNotificationReadRequestDto, MarkNotificationReadRequestSchema } from './dtos/request/mark-notification-read-request.dto';
import { SHARED_CONSTANTS } from '../../shared/constants/shared.constant';

@ApiTags(SHARED_CONSTANTS.NOTIFICATION.key)
@UseGuards(SessionGuard)
@Controller({ path: ENVIRONMENT_CONSTANTS.RESOURCES.NOTIFICATION, version: ENVIRONMENT_CONSTANTS.VERSION.V1 })
export class NotificationController {
  constructor (private readonly notificationService: NotificationService) {}

  @Get()
  async getNotifications (
    @Req() req: RequestContext,
    @ParamsQueryAndHeaders({ schema: ListNotificationsRequestSchema }) dto: ListNotificationsRequestDto
  ): Promise<NotificationDto[]> {
    return this.notificationService.getNotifications({ ...dto, userId: req.user.userId });
  }

  @Patch(':id/read')
  async markNotificationAsRead (
    @Req() req: RequestContext,
    @ParamsQueryAndHeaders({ schema: MarkNotificationReadRequestSchema }) dto: MarkNotificationReadRequestDto
  ): Promise<NotificationDto> {
    return this.notificationService.markAsRead({ ...dto, userId: req.user.userId });
  }

  @Sse('stream')
  streamNotifications (@Req() req: RequestContext): Observable<MessageEvent> {
    return this.notificationService.getEventStream({ userId: req.user.userId }).pipe(map(notification => ({ data: notification }) as MessageEvent));
  }
}
