import { Inject, Injectable } from '@nestjs/common';
import { DomainEventType, OutboxRepository, PaymentStatus, PostgresService } from '@common/libs';

import { PaymentRepository } from '../../repositories/payment.repository';
import { PaymentDto } from '../../dtos/payment/payment.dto';
import { FailPaymentDto } from '../../dtos/input/fail-payment.dto';
import { FailPaymentInTransactionDto } from '../../dtos/helper/fail-payment-in-transaction.dto';
import { PaymentHelper } from '../../helpers/payment.helper';

@Injectable()
export class FailPaymentUseCase {
  constructor (
    @Inject(PostgresService) private readonly postgresService: PostgresService,
    @Inject(OutboxRepository) private readonly outboxRepository: OutboxRepository,
    private readonly paymentRepository: PaymentRepository
  ) {}

  async execute (dto: FailPaymentDto): Promise<PaymentDto | null> {
    if (dto.adapter) return this.fail({ ...dto, adapter: dto.adapter });
    return this.postgresService.getWriteConnection().transaction({ callback: async adapter => this.fail({ ...dto, adapter }) });
  }

  private async fail ({ paymentId, failureReason, failureCode, providerChargeId, adapter }: FailPaymentInTransactionDto): Promise<PaymentDto | null> {
    const failed = await this.paymentRepository.updatePaymentStatus({
      paymentId,
      status: PaymentStatus.FAILED,
      ...(failureReason && { failureReason }),
      ...(failureCode && { failureCode }),
      ...(providerChargeId && { providerChargeId }),
      adapter
    });

    if (!failed) return null;

    await this.outboxRepository.createEvent({
      aggregateType: 'Payment',
      aggregateId: paymentId,
      eventType: DomainEventType.PAYMENT_FAILED,
      payload: PaymentHelper.failedEventPayload({ payment: failed }),
      adapter
    });

    return failed;
  }
}
