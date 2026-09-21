import { Injectable } from '@nestjs/common';
import { PaginatedResponseDto } from '@common/libs';

import { AuditBaseUseCase } from '../base/audit-base.use-case';
import { AuditLogDto } from '../../dtos/audit/audit-log.dto';
import { ListAuditLogsDto } from '../../dtos/request/list-audit-logs.dto';

@Injectable()
export class GetAuditLogsUseCase extends AuditBaseUseCase<ListAuditLogsDto, PaginatedResponseDto<AuditLogDto>> {
  async execute (query: ListAuditLogsDto): Promise<PaginatedResponseDto<AuditLogDto>> {
    const { page, limit } = query;

    const criteria = { ...query, offset: (page - 1) * limit };

    const logs = await this.auditLogRepository.findPaginated(criteria);
    const total = await this.auditLogRepository.countLogs(criteria);

    return new PaginatedResponseDto({ data: logs, total, page, pageSize: limit });
  }
}
