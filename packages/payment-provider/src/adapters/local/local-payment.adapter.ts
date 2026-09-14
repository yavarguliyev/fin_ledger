import { Injectable, Logger } from '@nestjs/common';
import { v7 as uuid } from 'uuid';
import { PaymentProvider, ProviderChargeStatus } from '@common/shared-libs';

import { ChargePaymentDto } from '../../dtos/charge-payment.dto';
import { PayoutFundsDto } from '../../dtos/payout-funds.dto';
import { ProviderChargeResultDto } from '../../dtos/provider-charge-result.dto';
import { ProviderMethodDetailsDto } from '../../dtos/provider-method-details.dto';
import { ProviderMethodResultDto } from '../../dtos/provider-method-result.dto';
import { RefundPaymentDto } from '../../dtos/refund-payment.dto';
import { WebhookEventDto } from '../../dtos/webhook-event.dto';
import { IPaymentProvider } from '../../interfaces/payment-provider.interface';
import { buildProviderMethodResult } from '../../helpers/build-provider-method.helper';
import { buildNotFoundMethodResult } from '../../helpers/build-not-found-method-result.helper';

@Injectable()
export class LocalPaymentAdapter implements IPaymentProvider {
  private readonly logger = new Logger(LocalPaymentAdapter.name);
  private readonly paymentMethods = new Map<string, ProviderMethodResultDto>();
  readonly providerName = PaymentProvider.LOCAL;

  charge (dto: ChargePaymentDto): Promise<ProviderChargeResultDto> {
    this.logger.log(`Processing local charge: ${dto.amount} ${dto.currency} [key: ${dto.idempotencyKey}]`);
    return Promise.resolve({
      chargeId: `loc_ch_${uuid()}`,
      status: ProviderChargeStatus.SUCCEEDED,
      amount: dto.amount,
      currency: dto.currency,
      rawResponse: { provider: 'local', chargedAt: new Date().toISOString() }
    });
  }

  payout (dto: PayoutFundsDto): Promise<ProviderChargeResultDto> {
    this.logger.log(`Processing local payout: ${dto.amount} ${dto.currency} to ${dto.recipientToken}`);
    return Promise.resolve({
      chargeId: `loc_po_${uuid()}`,
      status: ProviderChargeStatus.SUCCEEDED,
      amount: dto.amount,
      currency: dto.currency,
      rawResponse: { provider: 'local', paidOutAt: new Date().toISOString() }
    });
  }

  refund (dto: RefundPaymentDto): Promise<ProviderChargeResultDto> {
    this.logger.log(`Processing local refund: ${dto.amount} ${dto.currency} for charge ${dto.chargeId}`);
    return Promise.resolve({
      chargeId: `loc_rf_${uuid()}`,
      status: ProviderChargeStatus.SUCCEEDED,
      amount: dto.amount,
      currency: dto.currency,
      rawResponse: { provider: 'local', refundedAt: new Date().toISOString() }
    });
  }

  createPaymentMethod (details: ProviderMethodDetailsDto): Promise<ProviderMethodResultDto> {
    const result = buildProviderMethodResult(details, PaymentProvider.LOCAL, 'loc_pm');
    this.paymentMethods.set(result.paymentMethodToken, result);
    return Promise.resolve(result);
  }

  verifyPaymentMethod (paymentMethodToken: string): Promise<ProviderMethodResultDto> {
    const existing = this.paymentMethods.get(paymentMethodToken);
    if (existing) return Promise.resolve(existing);
    return Promise.resolve(buildNotFoundMethodResult(paymentMethodToken, PaymentProvider.LOCAL));
  }

  constructWebhookEvent (payload: Buffer | string, signature: string): Promise<WebhookEventDto> {
    const raw = typeof payload === 'string' ? payload : payload.toString('utf-8');
    const parsed = JSON.parse(raw) as Record<string, unknown>;

    return Promise.resolve({
      eventId: typeof parsed['id'] === 'string' ? parsed['id'] : `loc_evt_${uuid()}`,
      eventType: typeof parsed['type'] === 'string' ? parsed['type'] : 'payment.succeeded',
      provider: PaymentProvider.LOCAL,
      payload: parsed,
      signature
    });
  }
}
