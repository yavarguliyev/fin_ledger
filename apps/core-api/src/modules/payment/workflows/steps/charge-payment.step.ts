import { Injectable, BadRequestException } from '@nestjs/common';
import { PaymentProviderRegistry, PaymentStatus, ProviderChargeStatus, WorkflowStep, WorkflowStepMeta, WorkflowSteps } from '@common/libs';
import { v7 as uuid } from 'uuid';

import { PaymentRepository } from '../../repositories/payment.repository';
import { DepositContextDto } from '../../dtos/payment/deposit-context.dto';

@Injectable()
@WorkflowStepMeta('ChargePayment')
export class ChargePaymentStep implements WorkflowStep<DepositContextDto> {
  readonly stepName: WorkflowSteps = 'ChargePayment';

  constructor (
    private readonly providerRegistry: PaymentProviderRegistry,
    private readonly paymentRepository: PaymentRepository
  ) {}

  async execute (context: DepositContextDto): Promise<void> {
    if (!context.paymentId) throw new BadRequestException('Payment ID is required for ChargePayment step');

    const providerName = context.provider!;
    const provider = this.providerRegistry.get(providerName);

    const chargeResult = await provider.charge({
      amount: context.dto.amountMinor,
      currency: context.dto.currency,
      paymentMethodToken: context.providerMethodId,
      idempotencyKey: context.dto.idempotencyKey,
      description: `Deposit: ${context.paymentId}`
    });

    if (chargeResult.status !== ProviderChargeStatus.SUCCEEDED) {
      const failureReason = chargeResult.failureReason ?? 'Charge failed';
      await this.paymentRepository.updatePaymentStatus(context.paymentId, { status: PaymentStatus.FAILED, failureReason });
      throw new BadRequestException(chargeResult.failureReason ?? 'Payment charge was declined');
    }

    context.providerChargeId = chargeResult.chargeId;

    await this.paymentRepository.updatePaymentStatus(context.paymentId, { providerChargeId: chargeResult.chargeId });
  }

  async compensate (context: DepositContextDto): Promise<void> {
    if (!context.providerChargeId || !context.paymentId) return;

    try {
      const providerName = context.provider!;
      const provider = this.providerRegistry.get(providerName);

      await provider.refund({
        chargeId: context.providerChargeId,
        amount: context.dto.amountMinor,
        currency: context.dto.currency,
        idempotencyKey: `refund_${context.paymentId}_${uuid()}`
      });

      await this.paymentRepository.updatePaymentStatus(context.paymentId, { status: PaymentStatus.REFUNDED });
    } catch {
      await this.paymentRepository.updatePaymentStatus(context.paymentId, { status: PaymentStatus.COMPENSATED });
    }
  }
}
