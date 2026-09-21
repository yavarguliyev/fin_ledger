import { Injectable } from '@nestjs/common';
import { BaseRepository, PostgresService, UnknownRecord } from '@common/libs';

import { AuditLogDto } from '../dtos/audit/audit-log.dto';
import { FindAuditLogsDto } from '../dtos/repository/find-audit-logs.dto';
import { CreateAuditLogDto } from '../dtos/repository/create-audit-log.dto';

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

  async findPaginated (dto: FindAuditLogsDto): Promise<AuditLogDto[]> {
    const { limit, offset } = dto;

    return this.findAll({ where: this.buildWhere(dto), orderBy: 'created_at', orderDirection: 'DESC', limit, offset });
  }

  async countLogs (dto: FindAuditLogsDto): Promise<number> {
    return this.count({ where: this.buildWhere(dto) });
  }

  private buildWhere = ({ action, entityType, entityId, actorUserId }: FindAuditLogsDto): UnknownRecord => ({
    ...(action && { action }),
    ...(entityType && { entity_type: entityType }),
    ...(entityId && { entity_id: entityId }),
    ...(actorUserId && { actor_user_id: actorUserId })
  });
}
