import { Injectable } from '@nestjs/common';

import { NotificationPageItemDto } from '../../dtos/response/notification-page-item.dto';
import { ListNotificationsDto } from '../../dtos/input/list-notifications.dto';
import { NotificationBaseUseCase } from '../base/base-notification.use-case';

@Injectable()
export class GetNotificationsUseCase extends NotificationBaseUseCase<ListNotificationsDto, NotificationPageItemDto[]> {
  async execute (dto: ListNotificationsDto): Promise<NotificationPageItemDto[]> {
    return this.notificationRepository.findByUser(dto);
  }
}
