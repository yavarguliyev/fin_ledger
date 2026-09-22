import { Injectable } from '@nestjs/common';
import { BaseExtendedRepository, PostgresService, WebhookStatus } from '@common/libs';

import { WebhookEventRecordDto } from '../dtos/webhook-event/webhook-event.dto';
import { FindWebhookEventDto } from '../dtos/repository/find-webhook-event.dto';
import { ClaimWebhookEventDto } from '../dtos/repository/claim-webhook-event.dto';
import { MarkWebhookEventDto } from '../dtos/repository/mark-webhook-event.dto';

@Injectable()
export class WebhookEventRepository extends BaseExtendedRepository<WebhookEventRecordDto> {
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
        attempts: 'attempts',
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

  async claim (dto: ClaimWebhookEventDto): Promise<WebhookEventRecordDto | null> {
    const existing = await this.findByProviderAndEventId({ provider: dto.provider, eventId: dto.eventId });
    if (existing) return this.increment({ id: existing.id, field: 'attempts', amount: 1 });

    return this.create({ data: { ...dto, status: WebhookStatus.RECEIVED, attempts: 1 } });
  }

  async markHandled ({ id, status, adapter }: MarkWebhookEventDto): Promise<WebhookEventRecordDto | null> {
    return this.update({ id, data: { status, ...(status === WebhookStatus.PROCESSED && { processedAt: new Date().toISOString() }) }, adapter });
  }
}
