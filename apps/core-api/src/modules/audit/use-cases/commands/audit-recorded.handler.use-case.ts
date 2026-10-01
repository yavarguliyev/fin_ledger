import { Injectable } from '@nestjs/common';
import { AuditEventDto, AuditEventTopic, KafkaMessageRecord, KafkaSubscribe } from '@common/libs';

import { AuditBaseUseCase } from '../base/audit-base.use-case';
import { CreateAuditLogSchema } from '../../dtos/repository/create-audit-log.dto';

@Injectable()
export class AuditRecordedHandler extends AuditBaseUseCase<KafkaMessageRecord<AuditEventDto>, void> {
  constructor () {
    super(AuditRecordedHandler.name);
  }

  @KafkaSubscribe({ topic: AuditEventTopic.RECORDED })
  async execute ({ value }: KafkaMessageRecord<AuditEventDto>): Promise<void> {
    const entry = CreateAuditLogSchema.parse(value);
    await this.auditLogRepository.createLog({ ...entry, ...(entry.actorUserId ? {} : { actorService: entry.actorService ?? 'core-api' }) });
  }
}
