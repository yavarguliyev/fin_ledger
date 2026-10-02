import { Inject, Injectable, Logger, OnApplicationBootstrap, OnModuleDestroy, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OutboxRepository, PostgresService } from '@common/database';
import { KafkaService } from '@common/kafka';
import { BaseHelper, CryptoHelper, OutboxDestination, OutboxStatus, RABBITMQ_SERVICE, RequestScope } from '@common/shared-libs';

import { RabbitmqService } from './rabbitmq.service';
import { PublishOutboxEventDto } from '../dtos/outbox/publish-outbox-event.dto';
import { RABBITMQ_CONSTANTS } from '../constants/messaging/rabbitmq.constant';
import { OutboxSettingsHelper } from '../helpers/outbox-settings.helper';
import { OutboxSettingsDto } from '../dtos/outbox/outbox-settings.dto';
import { OUTBOX_SETTINGS } from '../constants/outbox/outbox-settings.constant';

@Injectable()
export class OutboxPublisherService implements OnApplicationBootstrap, OnModuleDestroy {
  private intervalHandle: ReturnType<typeof setInterval> | null = null;
  private isPolling = false;
  private stopped = false;
  private wakeRequested = false;

  private readonly relayId = `${process.pid}-${CryptoHelper.uuid()}`;
  private readonly logger = new Logger(OutboxPublisherService.name);
  private readonly settings: OutboxSettingsDto;

  constructor (
    private readonly outboxRepository: OutboxRepository,
    @Inject(RABBITMQ_SERVICE) private readonly rabbitmqService: RabbitmqService,
    private readonly kafkaService: KafkaService,
    @Optional() configService?: ConfigService,
    @Optional() private readonly postgres?: PostgresService
  ) {
    this.settings = OutboxSettingsHelper.from({ ...(configService && { configService }) });
  }

  onApplicationBootstrap (): void {
    this.intervalHandle = setInterval(() => void RequestScope.runSystem(() => this.poll()), this.settings.pollIntervalMs);
    this.intervalHandle.unref();
    void this.postgres?.listen({ channel: OUTBOX_SETTINGS.NOTIFY_CHANNEL, onNotify: () => this.wake() });
  }

  wake (): void {
    if (this.isPolling) {
      this.wakeRequested = true;
      return;
    }

    void RequestScope.runSystem(() => this.poll());
  }

  onModuleDestroy (): void {
    this.stopped = true;
    if (this.intervalHandle) clearInterval(this.intervalHandle);
    this.intervalHandle = null;
  }

  async publishPendingEvents (): Promise<number> {
    const events = await this.outboxRepository.claimPendingBatch({
      limit: this.settings.batchSize,
      lockedBy: this.relayId,
      lockSeconds: RABBITMQ_CONSTANTS.OUTBOX_LOCK_SECONDS.key
    });

    for (const event of events) {
      await this.publishEvent({
        eventId: event.id,
        eventType: event.eventType,
        payload: event.payload,
        attempts: event.attempts,
        destination: event.destination
      });
    }

    return events.length;
  }

  async publishEvent ({ eventId, eventType, payload, attempts, destination }: PublishOutboxEventDto): Promise<void> {
    try {
      if (destination === OutboxDestination.KAFKA) await this.kafkaService.send({ topic: eventType, payload });
      else await this.rabbitmqService.publish({ payload, routingKey: eventType, persistent: true });

      await this.outboxRepository.markPublished({ id: eventId });
    } catch (error) {
      const lastError = BaseHelper.errorResponse({ error }).message;
      const outcome = await this.outboxRepository.rescheduleFailed({ id: eventId, attempts, lastError });

      if (outcome?.status === OutboxStatus.DEAD) {
        this.logger.error(`Outbox event ${eventId} is dead after ${outcome.attempts} attempts: ${lastError}`);
      } else this.logger.warn(`Outbox publish failed for ${eventId}, retrying: ${lastError}`);
    }
  }

  private async poll (): Promise<void> {
    if (this.stopped || this.isPolling) return;

    this.isPolling = true;

    try {
      let published = await this.publishPendingEvents();
      while (!this.stopped && published >= this.settings.batchSize) published = await this.publishPendingEvents();
    } catch (error) {
      this.logger.warn(`Outbox poll skipped: ${BaseHelper.errorResponse({ error }).message}`);
    } finally {
      this.isPolling = false;
    }

    if (this.wakeRequested && !this.stopped) {
      this.wakeRequested = false;
      await this.poll();
    }
  }
}
