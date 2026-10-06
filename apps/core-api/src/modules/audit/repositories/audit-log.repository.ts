import { Injectable } from '@nestjs/common';
import { BaseRepository, PostgresService } from '@common/libs';

import { AuditLogDto } from '../dtos/audit/audit-log.dto';
import { FindAuditLogsDto } from '../dtos/repository/find-audit-logs.dto';
import { CreateAuditLogDto } from '../dtos/repository/create-audit-log.dto';
import { AUDIT_LOG_LIST } from '../constants/list/audit-log-list.constant';

@Injectable()
export class AuditLogRepository extends BaseRepository<AuditLogDto> {
  constructor (postgresService: PostgresService) {
    super({
      service: postgresService,
      tableName: 'audit_log',
      columnMappings: {
        actorUserId: 'actor_user_id',
        actorRole: 'actor_role',
        actorService: 'actor_service',
        entityType: 'entity_type',
        entityId: 'entity_id',
        beforeState: 'before_state',
        afterState: 'after_state',
        ipAddress: 'ip_address',
        userAgent: 'user_agent',
        requestId: 'request_id',
        createdAt: 'created_at'
      }
    });
  }

  protected getSelectColumns (): string[] {
    return [
      'id',
      'actorUserId',
      'actorRole',
      'actorService',
      'action',
      'entityType',
      'entityId',
      'beforeState',
      'afterState',
      'ipAddress',
      'userAgent',
      'requestId',
      'createdAt'
    ];
  }

  async createLog (dto: CreateAuditLogDto): Promise<AuditLogDto | null> {
    return this.create({ data: dto });
  }

  async findPage ({ limit, action, entityType, entityId, actorUserId, before, beforeId }: FindAuditLogsDto): Promise<AuditLogDto[]> {
    const result = await this.service.getConnection().query<AuditLogDto>({
      sql: AUDIT_LOG_LIST.KEYSET_SQL,
      params: [action ?? null, entityType ?? null, entityId ?? null, actorUserId ?? null, before ?? null, beforeId ?? null, limit]
    });
    return result.rows;
  }
}
