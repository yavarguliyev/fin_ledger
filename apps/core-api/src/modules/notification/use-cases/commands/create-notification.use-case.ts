import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { CreateNotificationDto } from '../../dtos/input/create-notification.dto';
import { NotificationDto } from '../../dtos/notification/notification.dto';
import { NotificationBaseUseCase } from '../base/base-notification.use-case';

@Injectable()
export class CreateNotificationUseCase extends NotificationBaseUseCase<CreateNotificationDto, NotificationDto> {
  async execute (dto: CreateNotificationDto): Promise<NotificationDto> {
    const notification = await this.notificationRepository.createNotification(dto);
    if (!notification) throw new InternalServerErrorException('Failed to create notification');
    this.streamProvider.broadcast({ userId: dto.userId, notification });
    return notification;
  }
}
