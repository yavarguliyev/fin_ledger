import { Injectable } from '@nestjs/common';

import { AuditBaseUseCase } from '../base/audit-base.use-case';
import { AuditLogDto } from '../../dtos/audit/audit-log.dto';
import { ListAuditLogsDto } from '../../dtos/request/list-audit-logs.dto';

@Injectable()
export class GetAuditLogsUseCase extends AuditBaseUseCase<ListAuditLogsDto, AuditLogDto[]> {
  async execute (query: ListAuditLogsDto): Promise<AuditLogDto[]> {
    return this.auditLogRepository.findPage(query);
  }
}
