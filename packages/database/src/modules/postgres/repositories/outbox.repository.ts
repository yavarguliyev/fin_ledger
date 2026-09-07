import { Injectable } from '@nestjs/common';
import { DomainEventType, OutboxStatus } from '@common/shared-libs';

import { BaseRepository } from './base.repository';
import { PostgresService } from '../services/postgres.service';
import { DatabaseAdapter } from '../../interfaces/database.interface';
import { OutboxBaseFields } from '../../interfaces/database.interface';
import { CreateEventDto } from '../../dtos/create-event.dto';

@Injectable()
export class OutboxRepository extends BaseRepository<OutboxBaseFields> {
  constructor (postgresService: PostgresService) {
    super(postgresService, 'outbox_events', {
      aggregateType: 'aggregate_type',
      aggregateId: 'aggregate_id',
      eventType: 'event_type',
      createdAt: 'created_at',
      publishedAt: 'published_at'
    });
  }

  protected getSelectColumns (): string[] {
    return ['id', 'aggregateType', 'aggregateId', 'eventType', 'payload', 'status', 'createdAt', 'publishedAt'];
  }

  async createEvent (dto: CreateEventDto, adapter?: DatabaseAdapter): Promise<OutboxBaseFields | null> {
    return this.create(
      {
        aggregateType: dto.aggregateType,
        aggregateId: dto.aggregateId,
        eventType: dto.eventType as DomainEventType,
        payload: dto.payload,
        status: OutboxStatus.PENDING
      },
      undefined,
      adapter
    );
  }

  async findPendingBatch (limit: number): Promise<OutboxBaseFields[]> {
    return this.findAll({
      where: { status: OutboxStatus.PENDING },
      orderBy: 'created_at',
      orderDirection: 'ASC',
      limit
    });
  }

  async markPublished (id: string): Promise<void> {
    await this.update(id, { status: OutboxStatus.PUBLISHED, publishedAt: new Date() });
  }

  async markFailed (id: string): Promise<void> {
    await this.update(id, { status: OutboxStatus.FAILED });
  }
}
