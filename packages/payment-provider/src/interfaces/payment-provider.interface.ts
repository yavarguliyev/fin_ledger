import { PaymentProvider } from '@common/shared-libs';

import { ChargePaymentDto } from '../dtos/charge-payment.dto';
import { PayoutFundsDto } from '../dtos/payout-funds.dto';
import { RefundPaymentDto } from '../dtos/refund-payment.dto';
import { ProviderChargeResultDto } from '../dtos/provider-charge-result.dto';
import { ProviderMethodResultDto } from '../dtos/provider-method-result.dto';
import { WebhookEventDto } from '../dtos/webhook-event.dto';
import { CreateSetupSessionDto, SetupSessionResultDto } from '../dtos/setup-session.dto';

export interface NormalizedCardDetails {
  readonly number: string;
  readonly expMonth: number;
  readonly expYear: number;
  readonly cvc?: string | undefined;
  readonly name?: string | undefined;
}

export interface IPaymentProvider {
  readonly providerName: PaymentProvider;
  charge(dto: ChargePaymentDto): Promise<ProviderChargeResultDto>;
  payout(dto: PayoutFundsDto): Promise<ProviderChargeResultDto>;
  refund(dto: RefundPaymentDto): Promise<ProviderChargeResultDto>;
  verifyPaymentMethod(paymentMethodToken: string): Promise<ProviderMethodResultDto>;
  constructWebhookEvent(payload: Buffer | string, signature: string): Promise<WebhookEventDto>;
  createSetupSession?(params: CreateSetupSessionDto): Promise<SetupSessionResultDto>;
  retrieveSessionPaymentMethod?(sessionId: string): Promise<ProviderMethodResultDto>;
}
