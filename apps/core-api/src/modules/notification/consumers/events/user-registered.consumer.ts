import { Inject, Injectable } from '@nestjs/common';
import { DomainEventType, NotificationType, RABBITMQ_SERVICE, RabbitmqService } from '@common/libs';

import { NotificationBaseConsumer } from '../base/notification.consumer';
import { NotificationService } from '../../notification.service';
import { UserRegisteredPayloadDto } from '../../dtos/user/user-register-payload.dto';

@Injectable()
export class UserRegisteredConsumer extends NotificationBaseConsumer<UserRegisteredPayloadDto> {
  protected readonly title = 'Welcome!';
  protected readonly eventType = DomainEventType.USER_REGISTERED;
  protected readonly notificationType = NotificationType.SYSTEM;

  constructor (
    @Inject(RABBITMQ_SERVICE)
    protected override readonly rabbitmqService: RabbitmqService,
    protected override readonly notificationService: NotificationService
  ) {
    super(rabbitmqService, notificationService, UserRegisteredConsumer.name);
  }

  protected getUserId (payload: UserRegisteredPayloadDto): string {
    return payload.userId;
  }

  protected getContent (payload: UserRegisteredPayloadDto): string {
    return `Welcome ${payload.displayName} to our payment platform!`;
  }
}
