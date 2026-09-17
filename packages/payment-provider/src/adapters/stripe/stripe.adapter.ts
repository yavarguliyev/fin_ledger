import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { DigitalWalletType, PaymentProvider, ProviderChargeStatus } from '@common/shared-libs';

import { ChargePaymentDto } from '../../dtos/charge-payment.dto';
import { PayoutFundsDto } from '../../dtos/payout-funds.dto';
import { ProviderChargeResultDto } from '../../dtos/provider-charge-result.dto';
import { ProviderMethodResultDto } from '../../dtos/provider-method-result.dto';
import { RefundPaymentDto } from '../../dtos/refund-payment.dto';
import { WebhookEventDto } from '../../dtos/webhook-event.dto';
import { CreateSetupSessionDto, SetupSessionResultDto } from '../../dtos/setup-session.dto';
import { BasePaymentAdapter } from '../base/base-payment.adapter';
import { PaymentProviderHelper } from '../../helpers/payment-provider.helper';
import { ExecuteOperationDto, OperationDto } from '../../dtos/base-payment.dto';

@Injectable()
export class StripeAdapter extends BasePaymentAdapter {
  readonly providerName = PaymentProvider.STRIPE;

  private readonly stripe: Stripe | null;
  private readonly webhookSecret: string | undefined;

  constructor (protected readonly configService: ConfigService) {
    super(StripeAdapter.name);
    const secretKey = this.getEnvValue('STRIPE_SECRET_KEY', configService);

    this.webhookSecret = this.getEnvValue('STRIPE_WEBHOOK_SECRET', configService);
    this.stripe = secretKey ? new Stripe(secretKey, { apiVersion: '2026-08-26.dahlia' }) : null;

    if (this.stripe) this.logger.log('Stripe client initialized successfully');
    else this.logger.warn('Stripe secret key not provided. Running in simulated mode.');
  }

  constructWebhookEvent (payload: Buffer | string, signature: string): Promise<WebhookEventDto> {
    if (this.stripe && this.webhookSecret && signature) {
      const event = this.stripe.webhooks.constructEvent(payload, signature, this.webhookSecret);
      const data = event.data.object as unknown as Record<string, unknown>;
      return Promise.resolve({ eventId: event.id, eventType: event.type, provider: PaymentProvider.STRIPE, payload: data, signature });
    }

    return Promise.resolve(this.simulateWebhook(payload, signature));
  }

  override async verifyPaymentMethod (token: string): Promise<ProviderMethodResultDto> {
    if (!this.stripe) return super.verifyPaymentMethod(token);

    return this.executeMethodOperation({
      token,
      walletType: undefined,
      operation: async () => this.toMethodResult(await this.stripe!.paymentMethods.retrieve(token))
    });
  }

  async charge (dto: ChargePaymentDto): Promise<ProviderChargeResultDto> {
    const operation = async (): Promise<OperationDto> => {
      const customerId = await PaymentProviderHelper.resolveCustomerForCharge({ client: this.stripe!, dto });
      const params = PaymentProviderHelper.buildChargeParams({ dto, customerId });
      const pi = await this.stripe!.paymentIntents.create(params, { idempotencyKey: dto.idempotencyKey });
      const status = pi.status === 'succeeded' ? ProviderChargeStatus.SUCCEEDED : ProviderChargeStatus.PENDING;
      return { id: pi.id, status };
    };

    return this.stripeOperation({ prefix: 'ch', amount: dto.amount, currency: dto.currency, operation });
  }

  async payout ({ amount, description, idempotencyKey, recipientToken, currency: curr }: PayoutFundsDto): Promise<ProviderChargeResultDto> {
    const operation = async (): Promise<string> => {
      const currency = curr.toLowerCase();
      const options = { idempotencyKey };
      const desc = description ? { description } : {};

      const res = recipientToken.startsWith('acct_')
        ? await this.stripe!.transfers.create({ amount, currency, destination: recipientToken, ...desc }, options)
        : await this.stripe!.payouts.create({ amount, currency, ...desc }, options);

      return res.id;
    };

    return this.stripeOperation({ prefix: 'po', amount: amount, currency: curr, operation });
  }

  async refund ({ currency, amount, chargeId, idempotencyKey }: RefundPaymentDto): Promise<ProviderChargeResultDto> {
    const operation = async (): Promise<string> => {
      const isPi = chargeId.startsWith('pi_');
      const refund = await this.stripe!.refunds.create(
        { amount, ...(isPi ? { payment_intent: chargeId } : { charge: chargeId }) },
        { idempotencyKey }
      );

      return refund.id;
    };

    return this.stripeOperation({ prefix: 're', amount, currency, operation });
  }

  async createSetupSession (dto: CreateSetupSessionDto): Promise<SetupSessionResultDto> {
    if (!this.stripe) throw new InternalServerErrorException('Stripe client not initialized');
    return PaymentProviderHelper.createSetupSession({ client: this.stripe, session: dto });
  }

  async retrieveSessionPaymentMethod (sessionId: string): Promise<ProviderMethodResultDto> {
    if (!this.stripe) throw new InternalServerErrorException('Stripe client not initialized');
    return PaymentProviderHelper.retrieveSessionMethod({ client: this.stripe, sessionId });
  }

  private async stripeOperation ({ prefix, amount, currency, operation }: ExecuteOperationDto): Promise<ProviderChargeResultDto> {
    if (!this.stripe) return this.buildSimulatedResult(prefix, amount, currency);
    return this.executeOperation({ prefix, amount, currency, operation });
  }

  private toMethodResult (pm: Stripe.PaymentMethod, walletType?: DigitalWalletType): ProviderMethodResultDto {
    return this.mapVerifiedMethod({
      token: pm.id,
      brand: PaymentProviderHelper.normalizeBrand({ brand: pm.card?.brand }),
      last4: pm.card?.last4 ?? undefined,
      walletType
    });
  }
}
