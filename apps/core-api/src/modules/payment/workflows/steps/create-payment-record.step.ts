import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PaymentStatus, PaymentType, WorkflowStep, WorkflowStepMeta, WorkflowSteps } from '@common/libs';

import { PaymentRepository } from '../../repositories/payment.repository';
import { DepositContextDto } from '../../dtos/payment/deposit-context.dto';

@Injectable()
@WorkflowStepMeta('CreatePaymentRecord')
export class CreatePaymentRecordStep implements WorkflowStep<DepositContextDto> {
  readonly stepName: WorkflowSteps = 'CreatePaymentRecord';

  constructor (private readonly paymentRepository: PaymentRepository) {}

  async execute (context: DepositContextDto): Promise<void> {
    const existing = await this.paymentRepository.findByIdempotencyKey(context.dto.idempotencyKey);
    if (existing) {
      context.paymentId = existing.id;
      context.payment = existing;
      return;
    }

    const record = await this.paymentRepository.createPayment({
      idempotencyKey: context.dto.idempotencyKey,
      paymentMethodId: context.dto.paymentMethodId,
      amountMinor: context.dto.amountMinor,
      currency: context.dto.currency,
      metadata: context.dto.metadata,
      userId: context.userId,
      type: PaymentType.DEPOSIT,
      status: PaymentStatus.PENDING,
      walletId: context.walletId ?? '',
      ledgerAccountId: context.ledgerAccountId ?? ''
    });

    if (!record) throw new InternalServerErrorException('Failed to create payment record');

    context.paymentId = record.id;
    context.payment = record;
  }

  async compensate (context: DepositContextDto): Promise<void> {
    if (!context.paymentId) return;
    await this.paymentRepository.updatePaymentStatus(context.paymentId, { status: PaymentStatus.COMPENSATED });
  }
}
