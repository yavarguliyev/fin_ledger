import { Inject, Injectable, Logger, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import { OutboxRepository } from '@common/database';
import { BaseHelper, CryptoHelper, OutboxDestination, OutboxStatus, RABBITMQ_SERVICE, RequestScope } from '@common/shared-libs';
import { KafkaService } from '@common/kafka';

import { RabbitmqService } from './rabbitmq.service';
import { PublishOutboxEventDto } from '../dtos/outbox/publish-outbox-event.dto';
import { RABBITMQ_CONSTANTS } from '../constants/messaging/rabbitmq.constant';

@Injectable()
export class OutboxPublisherService implements OnApplicationBootstrap, OnModuleDestroy {
  private intervalHandle: ReturnType<typeof setInterval> | null = null;
  private isPolling = false;
  private stopped = false;
  private readonly relayId = `${process.pid}-${CryptoHelper.uuid()}`;
  private readonly logger = new Logger(OutboxPublisherService.name);

  constructor (
    private readonly outboxRepository: OutboxRepository,
    @Inject(RABBITMQ_SERVICE) private readonly rabbitmqService: RabbitmqService,
    private readonly kafkaService: KafkaService
  ) {}

  onApplicationBootstrap (): void {
    this.intervalHandle = setInterval(() => void RequestScope.runSystem(() => this.poll()), RABBITMQ_CONSTANTS.OUTBOX_POLL_INTERVAL_MS.key);
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
    const events = await this.outboxRepository.claimPendingBatch({
      limit: RABBITMQ_CONSTANTS.OUTBOX_BATCH_SIZE.key,
      lockedBy: this.relayId,
      lockSeconds: RABBITMQ_CONSTANTS.OUTBOX_LOCK_SECONDS.key
    });

    for (const event of events) {
      await this.publishEvent({ eventId: event.id, eventType: event.eventType, payload: event.payload, attempts: event.attempts, destination: event.destination });
    }
  }

  async publishEvent ({ eventId, eventType, payload, attempts, destination }: PublishOutboxEventDto): Promise<void> {
    try {
      if (destination === OutboxDestination.KAFKA) await this.kafkaService.send({ topic: eventType, payload });
      else await this.rabbitmqService.publish({ payload, routingKey: eventType, persistent: true });

      await this.outboxRepository.markPublished({ id: eventId });
    } catch (error) {
      const lastError = BaseHelper.errorResponse({ error }).message;
      const outcome = await this.outboxRepository.rescheduleFailed({ id: eventId, attempts, lastError });

      if (outcome?.status === OutboxStatus.DEAD) this.logger.error(`Outbox event ${eventId} is dead after ${outcome.attempts} attempts: ${lastError}`);
      else this.logger.warn(`Outbox publish failed for ${eventId}, retrying: ${lastError}`);
    }
  }
}
