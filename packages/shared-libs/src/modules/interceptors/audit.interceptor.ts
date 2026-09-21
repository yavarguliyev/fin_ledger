import { CallHandler, ExecutionContext, Inject, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';

import { AuditEventDto } from '../dtos/audit/audit-event.dto';
import { AuditMetadataDto } from '../dtos/audit/audit-metadata.dto';
import { AuditEventPublisher } from '../interfaces/audit-event-publisher.interface';
import { AuditRequest } from '../interfaces/audit-request.interface';
import { AuditEventTopic } from '../enums/common/audit.enum';
import { AuditHelper } from '../helpers/audit.helper';
import { AUDITED_METADATA, KAFKA_SERVICE } from '../tokens/base.token';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor (
    private readonly reflector: Reflector,
    @Inject(KAFKA_SERVICE) private readonly publisher: AuditEventPublisher
  ) {}

  intercept (context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const metadata = this.reflector.get<AuditMetadataDto | undefined>(AUDITED_METADATA, context.getHandler());
    if (!metadata) return next.handle();

    const request = context.switchToHttp().getRequest<AuditRequest>();

    return next.handle().pipe(tap(result => void this.publish(AuditHelper.buildEvent({ metadata, request, result }))));
  }

  private async publish (event: AuditEventDto): Promise<void> {
    try {
      await this.publisher.publish({ payload: { ...event }, topic: AuditEventTopic.RECORDED, ...(event.entityId && { key: event.entityId }) });
    } catch (error) {
      this.logger.error(`Audit event not published for ${event.action}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
