import { PaymentProvider } from '@common/shared-libs';

import { ChargePaymentDto } from '../dtos/charge-payment.dto';
import { PayoutFundsDto } from '../dtos/payout-funds.dto';
import { RefundPaymentDto } from '../dtos/refund-payment.dto';
import { ProviderChargeResultDto } from '../dtos/provider-charge-result.dto';
import { ProviderMethodDetailsDto } from '../dtos/provider-method-details.dto';
import { ProviderMethodResultDto } from '../dtos/provider-method-result.dto';
import { WebhookEventDto } from '../dtos/webhook-event.dto';

export interface IPaymentProvider {
  readonly providerName: PaymentProvider;
  charge(dto: ChargePaymentDto): Promise<ProviderChargeResultDto>;
  payout(dto: PayoutFundsDto): Promise<ProviderChargeResultDto>;
  refund(dto: RefundPaymentDto): Promise<ProviderChargeResultDto>;
  createPaymentMethod(details: ProviderMethodDetailsDto): Promise<ProviderMethodResultDto>;
  verifyPaymentMethod(paymentMethodToken: string): Promise<ProviderMethodResultDto>;
  constructWebhookEvent(payload: Buffer | string, signature: string): Promise<WebhookEventDto>;
}
