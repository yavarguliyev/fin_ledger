import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ENVIRONMENT_CONSTANTS, PaginatedResponseDto, ParamsQueryAndHeaders, Roles, RolesGuard, SessionGuard, UserRoles } from '@common/libs';

import { AuditService } from './audit.service';
import { AuditLogDto } from './dtos/audit/audit-log.dto';
import { ListAuditLogsDto, ListAuditLogsSchema } from './dtos/request/list-audit-logs.dto';
import { SHARED_CONSTANTS } from '../../shared/constants/shared.constant';

@ApiTags(SHARED_CONSTANTS.AUDIT_LOG.key)
@UseGuards(SessionGuard, RolesGuard)
@Roles({ roles: [UserRoles.GLOBAL_ADMIN] })
@Controller({ path: ENVIRONMENT_CONSTANTS.RESOURCES.AUDIT_LOG, version: ENVIRONMENT_CONSTANTS.VERSION.V1 })
export class AuditController {
  constructor (private readonly auditService: AuditService) {}

  @Get()
  async findAuditLogs (@ParamsQueryAndHeaders({ schema: ListAuditLogsSchema }) query: ListAuditLogsDto): Promise<PaginatedResponseDto<AuditLogDto>> {
    return this.auditService.getAuditLogs(query);
  }
}
