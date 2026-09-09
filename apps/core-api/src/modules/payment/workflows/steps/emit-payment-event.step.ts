import { Injectable, Inject } from '@nestjs/common';
import {
  AnalyticsEventTopic,
  DomainEventType,
  KAFKA_SERVICE,
  PaymentStatus,
  PaymentType,
  WorkflowStep,
  WorkflowStepMeta,
  WorkflowSteps
} from '@common/libs';
import { KafkaService } from '@common/kafka';

import { PaymentRepository } from '../../repositories/payment.repository';
import { DepositContextDto } from '../../dtos/payment/deposit-context.dto';

@Injectable()
@WorkflowStepMeta('EmitPaymentEvent')
export class EmitPaymentEventStep implements WorkflowStep<DepositContextDto> {
  readonly stepName: WorkflowSteps = 'EmitPaymentEvent';
  protected readonly [KAFKA_SERVICE]: KafkaService;

  constructor (
    private readonly paymentRepository: PaymentRepository,
    @Inject(KAFKA_SERVICE) kafkaService: KafkaService
  ) {
    this[KAFKA_SERVICE] = kafkaService;
  }

  async execute (context: DepositContextDto): Promise<void> {
    if (!context.paymentId || !context.walletId) return;

    await this.paymentRepository.updatePaymentStatus(context.paymentId, { status: PaymentStatus.COMPLETED });
    await this[KAFKA_SERVICE].publish(
      {
        amountMinor: context.dto.amountMinor,
        currency: context.dto.currency,
        userId: context.userId,
        paymentId: context.paymentId,
        walletId: context.walletId,
        status: PaymentStatus.COMPLETED,
        paymentType: PaymentType.DEPOSIT,
        timestamp: new Date().toISOString()
      },
      { topic: AnalyticsEventTopic.PAYMENT_COMPLETED, key: context.paymentId }
    );
  }

  async compensate (context: DepositContextDto): Promise<void> {
    if (!context.paymentId || !context.walletId) return;

    await this.paymentRepository.updatePaymentStatus(context.paymentId, {
      status: PaymentStatus.COMPENSATED
    });

    await this[KAFKA_SERVICE].publish(
      {
        amountMinor: context.dto.amountMinor,
        currency: context.dto.currency,
        userId: context.userId,
        paymentId: context.paymentId,
        walletId: context.walletId,
        status: PaymentStatus.COMPENSATED,
        paymentType: PaymentType.DEPOSIT,
        eventType: DomainEventType.PAYMENT_COMPENSATED,
        timestamp: new Date().toISOString()
      },
      { topic: AnalyticsEventTopic.PAYMENT_FAILED, key: context.paymentId }
    );
  }
}
