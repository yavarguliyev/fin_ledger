import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditInterceptor } from '@common/libs';

import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { AuditLogRepository } from './repositories/audit-log.repository';
import { AuditRecordedHandler } from './use-cases/commands/audit-recorded.handler.use-case';
import { GetAuditLogsUseCase } from './use-cases/queries/get-audit-logs.use-case';
import { SharedModule } from '../../shared/shared.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [SharedModule, AuthModule],
  controllers: [AuditController],
  providers: [AuditService, AuditLogRepository, AuditRecordedHandler, GetAuditLogsUseCase, { provide: APP_INTERCEPTOR, useClass: AuditInterceptor }],
  exports: [AuditLogRepository]
})
export class AuditModule {}
