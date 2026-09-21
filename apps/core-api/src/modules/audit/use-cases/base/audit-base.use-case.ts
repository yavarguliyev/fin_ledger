import { Inject, Logger } from '@nestjs/common';

import { AuditLogRepository } from '../../repositories/audit-log.repository';

export abstract class AuditBaseUseCase<TInput, TOutput> {
  protected readonly logger: Logger;

  @Inject(AuditLogRepository)
  protected readonly auditLogRepository!: AuditLogRepository;

  constructor (loggerContext: string) {
    this.logger = new Logger(loggerContext);
  }

  abstract execute(input: TInput): Promise<TOutput>;
}
