import { Injectable } from '@nestjs/common';
import { PaginatedResponseDto } from '@common/libs';

import { GetAuditLogsUseCase } from './use-cases/queries/get-audit-logs.use-case';
import { AuditLogDto } from './dtos/audit/audit-log.dto';
import { ListAuditLogsDto } from './dtos/request/list-audit-logs.dto';

@Injectable()
export class AuditService {
  constructor (private readonly getAuditLogsUseCase: GetAuditLogsUseCase) {}

  async getAuditLogs (query: ListAuditLogsDto): Promise<PaginatedResponseDto<AuditLogDto>> {
    return this.getAuditLogsUseCase.execute(query);
  }
}
