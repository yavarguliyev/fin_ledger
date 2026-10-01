import { Injectable } from '@nestjs/common';
import { DomainEventType, NotificationType, NotificationTitle } from '@common/libs';

import { NotificationBaseConsumer } from '../base/notification.consumer';
import { UserRegisteredPayloadDto } from '../../dtos/event/user-registered-payload.dto';

@Injectable()
export class UserRegisteredConsumer extends NotificationBaseConsumer<UserRegisteredPayloadDto> {
  protected readonly title = NotificationTitle.WELCOME;
  protected readonly eventType = DomainEventType.USER_REGISTERED;
  protected readonly notificationType = NotificationType.SYSTEM;

  constructor () {
    super(UserRegisteredConsumer.name);
  }

  protected getUserId (payload: UserRegisteredPayloadDto): string {
    return payload.userId;
  }

  protected getContent (payload: UserRegisteredPayloadDto): string {
    return `Welcome ${payload.displayName} to our payment platform!`;
  }
}
