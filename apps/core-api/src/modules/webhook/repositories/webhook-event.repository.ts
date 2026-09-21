import { Injectable } from '@nestjs/common';
import { BaseRepository, PostgresService } from '@common/libs';

import { WebhookEventRecordDto } from '../dtos/webhook-event/webhook-event.dto';
import { FindWebhookEventDto } from '../dtos/repository/find-webhook-event.dto';
import { RecordWebhookEventDto } from '../dtos/repository/record-webhook-event.dto';

@Injectable()
export class WebhookEventRepository extends BaseRepository<WebhookEventRecordDto> {
  constructor (postgresService: PostgresService) {
    super({
      service: postgresService,
      tableName: 'webhook_events',
      columnMappings: {
        eventId: 'event_id',
        provider: 'provider',
        eventType: 'event_type',
        payload: 'payload',
        status: 'status',
        signatureVerified: 'signature_verified',
        lastError: 'last_error',
        receivedAt: 'received_at',
        processedAt: 'processed_at',
        createdAt: 'created_at'
      }
    });
  }

  protected getSelectColumns (): string[] {
    return ['id', 'eventId', 'provider', 'eventType', 'payload', 'status', 'signatureVerified', 'attempts', 'receivedAt', 'processedAt', 'createdAt'];
  }

  async findByProviderAndEventId ({ provider, eventId, adapter }: FindWebhookEventDto): Promise<WebhookEventRecordDto | null> {
    return this.findOne({ where: { provider, event_id: eventId }, adapter });
  }

  async recordEvent (dto: RecordWebhookEventDto): Promise<WebhookEventRecordDto | null> {
    const { adapter, ...event } = dto;
    return this.create({ data: event, adapter });
  }
}
