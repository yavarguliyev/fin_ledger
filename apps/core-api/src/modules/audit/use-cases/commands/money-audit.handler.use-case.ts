import { Injectable } from '@nestjs/common';
import { AnalyticsEventTopic, KafkaMessageRecord, KafkaSubscribe } from '@common/libs';

import { AuditBaseUseCase } from '../base/audit-base.use-case';
import { MONEY_AUDIT } from '../../constants/money/money-audit.constant';
import { MoneyAuditEventDto, MoneyAuditEventSchema } from '../../dtos/event/money-audit-event.dto';
import { RecordMoneyAuditDto } from '../../dtos/step/record-money-audit.dto';

@Injectable()
export class MoneyAuditHandler extends AuditBaseUseCase<RecordMoneyAuditDto, void> {
  constructor () {
    super(MoneyAuditHandler.name);
  }

  @KafkaSubscribe({ topic: AnalyticsEventTopic.WALLET_CREDITED })
  async walletCredited ({ value }: KafkaMessageRecord<MoneyAuditEventDto>): Promise<void> {
    return this.forWallet({ event: value, action: MONEY_AUDIT.WALLET_CREDITED, entityType: MONEY_AUDIT.WALLET });
  }

  @KafkaSubscribe({ topic: AnalyticsEventTopic.WALLET_DEBITED })
  async walletDebited ({ value }: KafkaMessageRecord<MoneyAuditEventDto>): Promise<void> {
    return this.forWallet({ event: value, action: MONEY_AUDIT.WALLET_DEBITED, entityType: MONEY_AUDIT.WALLET });
  }

  @KafkaSubscribe({ topic: AnalyticsEventTopic.PAYMENT_COMPLETED })
  async paymentCompleted ({ value }: KafkaMessageRecord<MoneyAuditEventDto>): Promise<void> {
    return this.forPayment({ event: value, action: MONEY_AUDIT.PAYMENT_COMPLETED, entityType: MONEY_AUDIT.PAYMENT });
  }

  @KafkaSubscribe({ topic: AnalyticsEventTopic.PAYMENT_FAILED })
  async paymentFailed ({ value }: KafkaMessageRecord<MoneyAuditEventDto>): Promise<void> {
    return this.forPayment({ event: value, action: MONEY_AUDIT.PAYMENT_FAILED, entityType: MONEY_AUDIT.PAYMENT });
  }

  async execute ({ event, action, entityType, entityId }: RecordMoneyAuditDto): Promise<void> {
    const parsed = MoneyAuditEventSchema.parse(event);

    await this.auditLogRepository.createLog({
      action,
      entityType,
      afterState: parsed,
      ...(entityId && { entityId }),
      ...(parsed.userId ? { actorUserId: parsed.userId } : { actorService: MONEY_AUDIT.ACTOR_SERVICE })
    });
  }

  private async forWallet (dto: RecordMoneyAuditDto): Promise<void> {
    return this.execute({ ...dto, ...(dto.event.walletId && { entityId: dto.event.walletId }) });
  }

  private async forPayment (dto: RecordMoneyAuditDto): Promise<void> {
    return this.execute({ ...dto, ...(dto.event.paymentId && { entityId: dto.event.paymentId }) });
  }
}
