import { Inject, Injectable, Logger, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import { OutboxRepository } from '@common/database';
import { BaseHelper, RABBITMQ_SERVICE } from '@common/shared-libs';

import { RabbitmqService } from './rabbitmq.service';
import { PublishOutboxEventDto } from '../dtos/outbox/publish-outbox-event.dto';
import { RABBITMQ_CONSTANTS } from '../constants/rabbitmq.constant';

@Injectable()
export class OutboxPublisherService implements OnApplicationBootstrap, OnModuleDestroy {
  private intervalHandle: ReturnType<typeof setInterval> | null = null;
  private isPolling = false;
  private stopped = false;
  private readonly logger = new Logger(OutboxPublisherService.name);

  constructor (
    private readonly outboxRepository: OutboxRepository,
    @Inject(RABBITMQ_SERVICE) private readonly rabbitmqService: RabbitmqService
  ) {}

  onApplicationBootstrap (): void {
    this.intervalHandle = setInterval(() => void this.poll(), RABBITMQ_CONSTANTS.OUTBOX_POLL_INTERVAL_MS.key);
    this.intervalHandle.unref();
  }

  onModuleDestroy (): void {
    this.stopped = true;

    if (this.intervalHandle) clearInterval(this.intervalHandle);
    this.intervalHandle = null;
  }

  private async poll (): Promise<void> {
    if (this.stopped || this.isPolling) return;

    this.isPolling = true;

    try {
      await this.publishPendingEvents();
    } catch (error) {
      this.logger.warn(`Outbox poll skipped: ${BaseHelper.errorResponse({ error }).message}`);
    } finally {
      this.isPolling = false;
    }
  }

  async publishPendingEvents (): Promise<void> {
    const events = await this.outboxRepository.findPendingBatch({ limit: RABBITMQ_CONSTANTS.OUTBOX_BATCH_SIZE.key });
    for (const event of events) {
      await this.publishEvent({ eventId: event.id, eventType: event.eventType, payload: event.payload });
    }
  }

  async publishEvent ({ eventId, eventType, payload }: PublishOutboxEventDto): Promise<void> {
    try {
      await this.rabbitmqService.publish({ payload, routingKey: eventType, persistent: true });
      await this.outboxRepository.markPublished({ id: eventId });
    } catch (error) {
      this.logger.warn(`Outbox publish failed for ${eventId}: ${BaseHelper.errorResponse({ error }).message}`);
      await this.outboxRepository.markFailed({ id: eventId });
    }
  }
}
