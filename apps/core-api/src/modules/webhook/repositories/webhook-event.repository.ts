import { Injectable } from '@nestjs/common';
import { BaseRepository, DatabaseAdapter, PostgresService } from '@common/libs';

import { WebhookEventRecordDto } from '../dtos/webhook-event/webhook-event.dto';

@Injectable()
export class WebhookEventRepository extends BaseRepository<WebhookEventRecordDto> {
  constructor (postgresService: PostgresService) {
    super(postgresService, 'webhook_events', {
      eventId: 'event_id',
      provider: 'provider',
      eventType: 'event_type',
      payload: 'payload',
      status: 'status',
      createdAt: 'created_at'
    });
  }

  protected getSelectColumns (): string[] {
    return ['id', 'eventId', 'provider', 'eventType', 'payload', 'status', 'createdAt'];
  }

  async findByProviderAndEventId (provider: string, eventId: string, adapter?: DatabaseAdapter): Promise<WebhookEventRecordDto | null> {
    return this.findOne({ provider, event_id: eventId }, adapter);
  }

  async recordEvent (data: Partial<WebhookEventRecordDto>, adapter?: DatabaseAdapter): Promise<WebhookEventRecordDto | null> {
    return this.create(data, undefined, adapter);
  }
}
