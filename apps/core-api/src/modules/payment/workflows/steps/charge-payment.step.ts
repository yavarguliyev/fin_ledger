import { Injectable, BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import {
  PaymentCapability,
  PaymentOperation,
  PaymentProviderRegistry,
  PaymentStatus,
  ProviderChargeStatus,
  WorkflowStep,
  WorkflowStepMeta,
  WorkflowSteps
} from '@common/libs';

import { PaymentRepository } from '../../repositories/payment.repository';
import { IdempotencyHelper } from '../../helpers/idempotency.helper';
import { DepositContextDto } from '../../dtos/workflow/deposit-context.dto';

@Injectable()
@WorkflowStepMeta({ stepName: 'ChargePayment' })
export class ChargePaymentStep implements WorkflowStep<DepositContextDto> {
  readonly stepName: WorkflowSteps = 'ChargePayment';

  constructor (
    private readonly providerRegistry: PaymentProviderRegistry,
    private readonly paymentRepository: PaymentRepository
  ) {}

  async execute (context: DepositContextDto): Promise<void> {
    if (!context.paymentId) throw new BadRequestException('Payment ID is required for ChargePayment step');

    const providerName = context.provider!;
    const provider = this.providerRegistry.require({ providerName: providerName, capability: PaymentCapability.CHARGE });

    const chargeResult = await provider.charge({
      amount: context.dto.amountMinor,
      currency: context.dto.currency,
      paymentMethodToken: context.providerMethodId,
      idempotencyKey: context.dto.idempotencyKey,
      description: `Deposit: ${context.paymentId}`
    });

    if (chargeResult.status === ProviderChargeStatus.INDETERMINATE) {
      await this.paymentRepository.updatePaymentStatus({
        paymentId: context.paymentId,
        status: PaymentStatus.REQUIRES_ACTION,
        failureReason: chargeResult.failureReason ?? 'Provider outcome unconfirmed'
      });

      throw new ServiceUnavailableException('Payment outcome is unconfirmed and is awaiting reconciliation');
    }

    if (chargeResult.status !== ProviderChargeStatus.SUCCEEDED) {
      const failureReason = chargeResult.failureReason ?? 'Charge failed';
      await this.paymentRepository.updatePaymentStatus({ paymentId: context.paymentId, status: PaymentStatus.FAILED, failureReason });
      throw new BadRequestException(chargeResult.failureReason ?? 'Payment charge was declined');
    }

    context.providerChargeId = chargeResult.chargeId;

    await this.paymentRepository.updatePaymentStatus({ paymentId: context.paymentId, providerChargeId: chargeResult.chargeId });
  }

  async compensate (context: DepositContextDto): Promise<void> {
    if (!context.providerChargeId || !context.paymentId) return;

    try {
      const providerName = context.provider!;
      const provider = this.providerRegistry.require({ providerName: providerName, capability: PaymentCapability.CHARGE });

      await provider.refund({
        chargeId: context.providerChargeId,
        amount: context.dto.amountMinor,
        currency: context.dto.currency,
        idempotencyKey: IdempotencyHelper.forPayment({ operation: PaymentOperation.REFUND, paymentId: context.paymentId })
      });

      await this.paymentRepository.updatePaymentStatus({ paymentId: context.paymentId, status: PaymentStatus.COMPENSATED });
    } catch {
      await this.paymentRepository.updatePaymentStatus({ paymentId: context.paymentId, status: PaymentStatus.REQUIRES_ACTION });
    }
  }
}
