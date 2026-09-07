import { Injectable } from '@nestjs/common';
import { getSessionUser } from '@common/libs';

import { NotificationRepository } from '../../repositories/notification.repository';
import { NotificationDto } from '../../dtos/notification/notification.dto';
import { NotificationBaseUseCase } from '../base/base-notification.use-case';
import { GetNotificationsDto } from '../../dtos/notification/notification-event-config.dto';

@Injectable()
export class GetNotificationsUseCase extends NotificationBaseUseCase<GetNotificationsDto, NotificationDto[]> {
  constructor (private readonly notificationRepository: NotificationRepository) {
    super();
  }

  async execute ({ context, limit = 50 }: GetNotificationsDto): Promise<NotificationDto[]> {
    const { userId } = getSessionUser(context);
    return this.notificationRepository.findByUserId(userId, limit);
  }
}
