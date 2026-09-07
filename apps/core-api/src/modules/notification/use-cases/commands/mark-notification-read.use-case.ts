import { Injectable, NotFoundException } from '@nestjs/common';
import { getSessionUser } from '@common/libs';

import { NotificationRepository } from '../../repositories/notification.repository';
import { NotificationDto } from '../../dtos/notification/notification.dto';
import { NotificationBaseUseCase } from '../base/base-notification.use-case';
import { MarkNotificationReadDto } from '../../dtos/notification/notification-event-config.dto';

@Injectable()
export class MarkNotificationReadUseCase extends NotificationBaseUseCase<MarkNotificationReadDto, NotificationDto> {
  constructor (private readonly notificationRepository: NotificationRepository) {
    super();
  }

  async execute ({ notificationId, context }: MarkNotificationReadDto): Promise<NotificationDto> {
    const { userId } = getSessionUser(context);
    const updated = await this.notificationRepository.markAsRead(notificationId, userId);
    if (!updated) throw new NotFoundException('Notification not found or unauthorized');
    return updated;
  }
}
