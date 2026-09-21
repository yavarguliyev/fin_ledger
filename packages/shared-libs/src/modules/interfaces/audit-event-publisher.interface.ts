import type { PublishAuditEventDto } from '../dtos/audit/publish-audit-event.dto';

export interface AuditEventPublisher {
  publish(dto: PublishAuditEventDto): Promise<void>;
}
