import { Inject, OnModuleInit, Logger } from '@nestjs/common';
import { RabbitmqService, RABBITMQ_SERVICE, UnknownRecord, DomainEventType, NotificationType } from '@common/libs';

import { NotificationService } from '../../notification.service';
import { EventTitleDto } from '../../dtos/notification/event-title.dto';
import { NotificationHelper } from '../../helpers/notification.helper';

export abstract class NotificationBaseConsumer<TPayload extends UnknownRecord> implements OnModuleInit {
  @Inject(RABBITMQ_SERVICE)
  protected readonly rabbitmqService!: RabbitmqService;

  @Inject(NotificationService)
  protected readonly notificationService!: NotificationService;

  protected abstract readonly title: EventTitleDto;
  protected abstract readonly eventType: DomainEventType;
  protected abstract readonly notificationType: NotificationType;

  protected readonly logger = new Logger(NotificationBaseConsumer.name);

  constructor (protected readonly loggerContext: string) {
    this.logger = new Logger(loggerContext);
  }

  protected abstract getUserId(payload: TPayload): Promise<string | undefined> | string | undefined;
  protected abstract getContent(payload: TPayload): Promise<string> | string;

  async onModuleInit (): Promise<void> {
    await this.subscribe();
  }

  protected async subscribe (): Promise<void> {
    await this.rabbitmqService.subscribe({
      routingKey: this.eventType,
      handler: async message => {
      const payload = message as TPayload;
      const userId = await this.getUserId(payload);

      await NotificationHelper.handleEvent({
        title: this.title,
        notificationType: this.notificationType,
        logger: this.logger,
        payload,
        eventType: this.eventType,
        ...(userId && { userId }),
        content: await this.getContent(payload),
        notificationService: this.notificationService
      });
      }
    });
  }
}
