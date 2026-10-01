import { Injectable } from '@nestjs/common';
import { OutboxDestination, OutboxStatus, RequestScope } from '@common/shared-libs';

import { BaseRepository } from './base.repository';
import { PostgresService } from '../services/postgres.service';
import { OutboxBaseFields } from '../../interfaces/outbox-base-fields.interface';
import { OutboxClaimedEvent } from '../../interfaces/outbox-claimed-event.interface';
import { OutboxRescheduleResult } from '../../interfaces/outbox-reschedule-result.interface';
import { CreateEventDto } from '../../dtos/outbox/create-event.dto';
import { ClaimPendingBatchDto } from '../../dtos/outbox/claim-pending-batch.dto';
import { RescheduleFailedEventDto } from '../../dtos/outbox/reschedule-failed-event.dto';
import { OutboxEventIdDto } from '../../dtos/outbox/outbox-event-id.dto';
import { NextAggregateVersionDto } from '../../dtos/outbox/next-aggregate-version.dto';
import { OUTBOX_CONSTANTS } from '../../constants/outbox/outbox.constant';
import { OutboxHelper } from '../helpers/outbox.helper';

@Injectable()
export class OutboxRepository extends BaseRepository<OutboxBaseFields> {
  constructor (postgresService: PostgresService) {
    super({
      service: postgresService,
      tableName: 'outbox_events',
      columnMappings: {
        aggregateType: 'aggregate_type',
        aggregateId: 'aggregate_id',
        eventType: 'event_type',
        aggregateVersion: 'aggregate_version',
        availableAt: 'available_at',
        maxAttempts: 'max_attempts',
        lockedBy: 'locked_by',
        lockedUntil: 'locked_until',
        traceId: 'trace_id',
        lastError: 'last_error',
        createdAt: 'created_at',
        publishedAt: 'published_at'
      }
    });
  }

  protected getSelectColumns (): string[] {
    return [
      'id',
      'aggregateType',
      'aggregateId',
      'eventType',
      'aggregateVersion',
      'payload',
      'status',
      'attempts',
      'availableAt',
      'destination',
      'createdAt',
      'publishedAt'
    ];
  }

  async createEvent ({ aggregateType, aggregateId, eventType, payload, destination, adapter }: CreateEventDto): Promise<OutboxBaseFields | null> {
    const aggregateVersion = await this.nextAggregateVersion({ aggregateType, aggregateId, ...(adapter && { adapter }) });

    const traceId = RequestScope.correlationId();

    return this.create({
      data: {
        aggregateType,
        aggregateId,
        eventType,
        aggregateVersion,
        payload,
        status: OutboxStatus.PENDING,
        destination: destination ?? OutboxDestination.RABBITMQ,
        ...(traceId && { traceId })
      },
      ...(adapter && { adapter })
    });
  }

  async claimPendingBatch ({ limit, lockedBy, lockSeconds, adapter }: ClaimPendingBatchDto): Promise<OutboxClaimedEvent[]> {
    const db = adapter ?? this.service.getConnection();

    const result = await db.query<OutboxClaimedEvent>({
      sql: OUTBOX_CONSTANTS.CLAIM_PENDING_BATCH_SQL,
      params: [lockedBy, lockSeconds, limit]
    });

    return result.rows;
  }

  async markPublished ({ id, adapter }: OutboxEventIdDto): Promise<void> {
    const db = adapter ?? this.service.getConnection();
    await db.query({ sql: OUTBOX_CONSTANTS.MARK_PUBLISHED_SQL, params: [id] });
  }

  async rescheduleFailed ({ id, attempts, lastError, adapter }: RescheduleFailedEventDto): Promise<OutboxRescheduleResult | null> {
    const db = adapter ?? this.service.getConnection();

    const result = await db.query<OutboxRescheduleResult>({
      sql: OUTBOX_CONSTANTS.RESCHEDULE_FAILED_SQL,
      params: [id, OutboxHelper.backoffSeconds({ attempts }), lastError.slice(0, OUTBOX_CONSTANTS.LAST_ERROR_MAX_LENGTH)]
    });

    return result.rows[0] ?? null;
  }

  private async nextAggregateVersion ({ aggregateType, aggregateId, adapter }: NextAggregateVersionDto): Promise<number> {
    const db = adapter ?? this.service.getConnection();

    const result = await db.query<{ next: string }>({
      sql: 'SELECT COALESCE(MAX(aggregate_version), 0) + 1 AS next FROM outbox_events WHERE aggregate_type = $1 AND aggregate_id = $2',
      params: [aggregateType, aggregateId]
    });

    return Number(result.rows[0]?.next ?? 1);
  }
}
