import { Injectable } from '@nestjs/common';
import { OutboxStatus } from '@common/shared-libs';

import { BaseRepository } from './base.repository';
import { PostgresService } from '../services/postgres.service';
import { OutboxBaseFields } from '../../interfaces/outbox-base-fields.interface';
import { CreateEventDto } from '../../dtos/outbox/create-event.dto';
import { FindPendingBatchDto } from '../../dtos/outbox/find-pending-batch.dto';
import { OutboxEventIdDto } from '../../dtos/outbox/outbox-event-id.dto';
import { NextAggregateVersionDto } from '../../dtos/outbox/next-aggregate-version.dto';

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
      'createdAt',
      'publishedAt'
    ];
  }

  async createEvent ({ aggregateType, aggregateId, eventType, payload, adapter }: CreateEventDto): Promise<OutboxBaseFields | null> {
    const aggregateVersion = await this.nextAggregateVersion({ aggregateType, aggregateId, ...(adapter && { adapter }) });

    return this.create({
      data: { aggregateType, aggregateId, eventType, aggregateVersion, payload, status: OutboxStatus.PENDING },
      ...(adapter && { adapter })
    });
  }

  async findPendingBatch ({ limit }: FindPendingBatchDto): Promise<OutboxBaseFields[]> {
    return this.findAll({
      where: { status: OutboxStatus.PENDING },
      orderBy: 'created_at',
      orderDirection: 'ASC',
      limit
    });
  }

  async markPublished ({ id }: OutboxEventIdDto): Promise<void> {
    await this.update({ id, data: { status: OutboxStatus.PUBLISHED, publishedAt: new Date() } });
  }

  async markFailed ({ id }: OutboxEventIdDto): Promise<void> {
    await this.update({ id, data: { status: OutboxStatus.FAILED } });
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
