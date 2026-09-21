import { Injectable } from '@nestjs/common';

import { NotificationDto } from '../../dtos/notification/notification.dto';
import { ListNotificationsDto } from '../../dtos/input/list-notifications.dto';
import { NotificationBaseUseCase } from '../base/base-notification.use-case';

@Injectable()
export class GetNotificationsUseCase extends NotificationBaseUseCase<ListNotificationsDto, NotificationDto[]> {
  async execute (dto: ListNotificationsDto): Promise<NotificationDto[]> {
    return this.notificationRepository.findByUser(dto);
  }
}
