import { Inject, Injectable, Logger } from '@nestjs/common';
import { PaymentStatus } from '@common/libs';

import { HandlePaymentChargeEventDto } from '../../dtos/input/handle-payment-charge-event.dto';
import { WebhookBaseUseCase } from '../base/webhook-base.use-case';
import { CompletePaymentUseCase } from '../../../payment/use-cases/commands/complete-payment.use-case';
import { FailPaymentUseCase } from '../../../payment/use-cases/commands/fail-payment.use-case';
import { PaymentDto } from '../../../payment/dtos/payment/payment.dto';
import { ChargeEventHelper } from '../../helpers/charge-event.helper';
import { FindChargePaymentDto } from '../../dtos/helper/find-charge-payment.dto';

@Injectable()
export class HandlePaymentChargeEventUseCase extends WebhookBaseUseCase<HandlePaymentChargeEventDto, void> {
  private readonly logger = new Logger(HandlePaymentChargeEventUseCase.name);

  @Inject(CompletePaymentUseCase)
  private readonly completePayment!: CompletePaymentUseCase;

  @Inject(FailPaymentUseCase)
  private readonly failPayment!: FailPaymentUseCase;

  async execute ({ provider, payload, status, adapter }: HandlePaymentChargeEventDto): Promise<void> {
    const object = ChargeEventHelper.objectOf({ payload });
    const providerChargeId = ChargeEventHelper.chargeIdOf({ object });
    const payment = await this.findPayment({ provider, providerChargeId, paymentId: ChargeEventHelper.paymentIdOf({ object }), adapter });

    if (!payment) {
      this.logger.warn(`Payment not found for provider charge ID: ${providerChargeId}`);
      return;
    }

    const chargeIdToStore = !payment.providerChargeId && providerChargeId ? { providerChargeId } : {};

    if (status === PaymentStatus.COMPLETED) {
      await this.completePayment.execute({ paymentId: payment.id, ...chargeIdToStore, adapter });
      return;
    }

    const updated =
      status === PaymentStatus.FAILED
        ? await this.failPayment.execute({ paymentId: payment.id, ...chargeIdToStore, adapter })
        : await this.paymentRepository.updatePaymentStatus({ paymentId: payment.id, status, ...chargeIdToStore, adapter });

    if (!updated) this.logger.warn(`Ignored ${status} for payment ${payment.id}: already ${payment.status}`);
  }

  private async findPayment ({ provider, providerChargeId, paymentId, adapter }: FindChargePaymentDto): Promise<PaymentDto | null> {
    const byId = paymentId ? await this.paymentRepository.findById({ id: paymentId, adapter }) : null;
    if (byId && String(byId.provider) === provider) return byId;
    return providerChargeId ? this.paymentRepository.findByProviderChargeId({ provider, providerChargeId, adapter }) : null;
  }
}
