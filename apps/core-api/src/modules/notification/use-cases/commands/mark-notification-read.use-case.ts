import { Injectable, NotFoundException } from '@nestjs/common';

import { NotificationDto } from '../../dtos/notification/notification.dto';
import { MarkNotificationReadDto } from '../../dtos/input/mark-notification-read.dto';
import { NotificationBaseUseCase } from '../base/base-notification.use-case';

@Injectable()
export class MarkNotificationReadUseCase extends NotificationBaseUseCase<MarkNotificationReadDto, NotificationDto> {
  async execute (dto: MarkNotificationReadDto): Promise<NotificationDto> {
    const updated = await this.notificationRepository.markAsRead(dto);
    if (!updated) throw new NotFoundException('Notification not found or unauthorized');
    return updated;
  }
}
