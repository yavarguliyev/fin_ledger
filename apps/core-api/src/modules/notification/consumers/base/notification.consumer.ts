import { Inject, Logger } from '@nestjs/common';
import {
  BackgroundTask,
  BackgroundWorker,
  DomainEventType,
  InboxRepository,
  MESSAGE_BROKER,
  MessageBroker,
  NotificationType,
  ProcessRole,
  UnknownRecord
} from '@common/libs';

import { NotificationService } from '../../services/notification.service';
import { EventTitleDto } from '../../dtos/notification/event-title.dto';
import { NotificationHelper } from '../../helpers/notification.helper';
import { NOTIFICATION_QUEUE } from '../../constants/messaging/notification-queue.constant';

@BackgroundWorker({ role: ProcessRole.WORKER })
export abstract class NotificationBaseConsumer<TPayload extends UnknownRecord> implements BackgroundTask {
  @Inject(MESSAGE_BROKER)
  protected readonly broker!: MessageBroker;

  @Inject(InboxRepository)
  protected readonly inboxRepository!: InboxRepository;

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

  async start (): Promise<void> {
    await this.subscribe();
  }

  async stop (): Promise<void> {
    await this.broker.unsubscribe({ queue: this.queue() });
  }

  private queue (): string {
    return `${NOTIFICATION_QUEUE.PREFIX}.${this.eventType}`;
  }

  protected async subscribe (): Promise<void> {
    await this.broker.subscribe({
      queue: this.queue(),
      inbox: this.inboxRepository,
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
