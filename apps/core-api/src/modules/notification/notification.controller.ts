import { Controller, Get, Param, Patch, Query, Req, Sse, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Observable, map } from 'rxjs';
import { ENVIRONMENT_CONSTANTS, RequestContext, SessionGuard } from '@common/libs';

import { NotificationService } from './notification.service';
import { NotificationDto } from './dtos/notification/notification.dto';
import { SHARED_CONSTANTS } from '../../shared/constants/shared.constant';

@ApiTags(SHARED_CONSTANTS.NOTIFICATION.key)
@UseGuards(SessionGuard)
@Controller({ path: ENVIRONMENT_CONSTANTS.RESOURCES.NOTIFICATION, version: ENVIRONMENT_CONSTANTS.VERSION.V1 })
export class NotificationController {
  constructor (private readonly notificationService: NotificationService) {}

  @Get()
  async getNotifications (@Req() context: RequestContext, @Query('limit') limit?: number): Promise<NotificationDto[]> {
    return this.notificationService.getNotifications(context, limit ? Number(limit) : undefined);
  }

  @Patch(':id/read')
  async markNotificationAsRead (@Req() context: RequestContext, @Param('id') id: string): Promise<NotificationDto> {
    return this.notificationService.markAsRead(id, context);
  }

  @Sse('stream')
  streamNotifications (@Req() context: RequestContext): Observable<MessageEvent> {
    return this.notificationService.getEventStream(context).pipe(map(notification => ({ data: notification }) as MessageEvent));
  }
}
