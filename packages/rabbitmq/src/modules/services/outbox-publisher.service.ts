import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { OutboxRepository } from '@common/database';
import { DomainEventType, errorResponse, RABBITMQ_SERVICE, UnknownRecord } from '@common/shared-libs';

import { RabbitmqService } from './rabbitmq.service';
import { RabbitmqPublishOptions } from '../interfaces/queue.interface';
import { RABBITMQ_CONSTANTS } from '../constants/rabbitmq.constant';

@Injectable()
export class OutboxPublisherService implements OnModuleInit, OnModuleDestroy {
  private intervalHandle: ReturnType<typeof setInterval> | null = null;
  private readonly logger = new Logger(OutboxPublisherService.name);

  constructor (
    private readonly outboxRepository: OutboxRepository,
    @Inject(RABBITMQ_SERVICE) private readonly rabbitmqService: RabbitmqService
  ) {}

  onModuleInit (): void {
    this.intervalHandle = setInterval(() => {
      void this.publishPendingEvents();
    }, RABBITMQ_CONSTANTS.OUTBOX_POLL_INTERVAL_MS.key);
  }

  onModuleDestroy (): void {
    if (this.intervalHandle) clearInterval(this.intervalHandle);
  }

  async publishPendingEvents (): Promise<void> {
    const events = await this.outboxRepository.findPendingBatch(RABBITMQ_CONSTANTS.OUTBOX_BATCH_SIZE.key);
    for (const event of events) {
      await this.publishEvent(event.id, event.eventType, event.payload);
    }
  }

  async publishEvent (eventId: string, eventType: DomainEventType, payload: UnknownRecord): Promise<void> {
    const options: RabbitmqPublishOptions = { routingKey: eventType, persistent: true };

    try {
      await this.rabbitmqService.publish(payload, options);
      await this.outboxRepository.markPublished(eventId);
    } catch (error) {
      this.logger.warn(`Outbox publish failed for ${eventId}: ${errorResponse(error).message}`);
      await this.outboxRepository.markFailed(eventId);
    }
  }
}
