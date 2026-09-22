import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PaymentCapability, PaymentProvider, ProviderError } from '@common/shared-libs';

import { ChargePaymentDto } from '../../dtos/operation/charge-payment.dto';
import { PayoutFundsDto } from '../../dtos/operation/payout-funds.dto';
import { ProviderChargeResultDto } from '../../dtos/operation/provider-charge-result.dto';
import { ProviderMethodResultDto } from '../../dtos/operation/provider-method-result.dto';
import { RefundPaymentDto } from '../../dtos/operation/refund-payment.dto';
import { WebhookEventDto } from '../../dtos/operation/webhook-event.dto';
import { CreateSetupSessionDto } from '../../dtos/operation/create-setup-session.dto';
import { SetupSessionResultDto } from '../../dtos/operation/setup-session-result.dto';
import { VerifyPaymentMethodDto } from '../../dtos/contract/verify-payment-method.dto';
import { RetrieveSessionDto } from '../../dtos/contract/retrieve-session.dto';
import { ExtractSignatureDto } from '../../dtos/contract/extract-signature.dto';
import { ConstructWebhookEventDto } from '../../dtos/contract/construct-webhook-event.dto';
import { ClassifyErrorDto } from '../../dtos/adapter/classify-error.dto';
import { BasePaymentAdapter } from '../base/base-payment.adapter';
import { SupportsCharge } from '../../interfaces/supports-charge.interface';
import { SupportsHostedSetup } from '../../interfaces/supports-hosted-setup.interface';
import { SupportsMethodVault } from '../../interfaces/supports-method-vault.interface';
import { SupportsPayout } from '../../interfaces/supports-payout.interface';
import { SupportsWebhooks } from '../../interfaces/supports-webhooks.interface';
import { StripeErrorMapper } from './helpers/stripe-error.mapper.helper';
import { STRIPE_CLIENT_OPTIONS } from '../../constants/stripe/stripe-client-options.constant';
import { StripeAmountHelper } from './helpers/stripe-amount.helper';
import { StripeWebhookHelper } from './helpers/stripe-webhook.helper';
import { StripeMethodHelper } from './helpers/stripe-method.helper';
import { StripeOperationHelper } from './helpers/stripe-operation.helper';
import { ExecuteOperationDto } from '../../dtos/adapter/execute-operation.dto';

@Injectable()
export class StripeAdapter
  extends BasePaymentAdapter
  implements SupportsCharge, SupportsPayout, SupportsMethodVault, SupportsHostedSetup, SupportsWebhooks
{
  readonly providerName = PaymentProvider.STRIPE;

  readonly capabilities = [
    PaymentCapability.CHARGE,
    PaymentCapability.PAYOUT,
    PaymentCapability.METHOD_VAULT,
    PaymentCapability.HOSTED_SETUP,
    PaymentCapability.WEBHOOKS
  ] as const;

  private static readonly SIGNATURE_HEADER = 'stripe-signature';

  private readonly stripe: Stripe | null;
  private readonly isSimulated: boolean;
  private readonly webhookSecret: string | undefined;

  constructor (protected readonly configService: ConfigService) {
    super({ name: StripeAdapter.name });

    const configured = this.requireCredentials({ configService, keys: ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'] });

    this.isSimulated = !configured;
    const secretKey = this.getEnvValue({ key: 'STRIPE_SECRET_KEY', configService });
    this.webhookSecret = this.getEnvValue({ key: 'STRIPE_WEBHOOK_SECRET', configService });
    this.stripe = configured && secretKey ? new Stripe(secretKey, STRIPE_CLIENT_OPTIONS) : null;

    if (this.stripe) this.logger.log('Stripe client initialized successfully');
  }

  extractSignature ({ headers }: ExtractSignatureDto): string {
    return this.headerValue({ headers, name: StripeAdapter.SIGNATURE_HEADER });
  }

  constructWebhookEvent (dto: ConstructWebhookEventDto): Promise<WebhookEventDto> {
    try {
      if (!this.stripe || !this.webhookSecret) {
        if (!this.isSimulated) throw new UnauthorizedException('Stripe webhook signature cannot be verified');
        return Promise.resolve(this.simulateWebhook(dto));
      }

      return Promise.resolve(StripeWebhookHelper.verify({ ...dto, client: this.stripe, secret: this.webhookSecret }));
    } catch (error) {
      return Promise.reject(error instanceof Error ? error : new Error(String(error)));
    }
  }

  override async verifyPaymentMethod (dto: VerifyPaymentMethodDto): Promise<ProviderMethodResultDto> {
    if (!this.stripe) return super.verifyPaymentMethod(dto);
    const { paymentMethodToken: token } = dto;

    return this.executeMethodOperation({
      token,
      operation: async () => StripeMethodHelper.toMethodResult({ paymentMethod: await this.stripe!.paymentMethods.retrieve(token) })
    });
  }

  async charge (dto: ChargePaymentDto): Promise<ProviderChargeResultDto> {
    return this.stripeOperation({
      prefix: 'ch',
      amount: dto.amount,
      currency: dto.currency,
      operation: async () => StripeOperationHelper.createCharge({ client: this.stripe!, dto })
    });
  }

  async payout (dto: PayoutFundsDto): Promise<ProviderChargeResultDto> {
    return this.stripeOperation({
      prefix: 'po',
      amount: dto.amount,
      currency: dto.currency,
      operation: async () => StripeOperationHelper.createPayout({ client: this.stripe!, dto })
    });
  }

  async refund (dto: RefundPaymentDto): Promise<ProviderChargeResultDto> {
    return this.stripeOperation({
      prefix: 're',
      amount: dto.amount,
      currency: dto.currency,
      operation: async () => StripeOperationHelper.createRefund({ client: this.stripe!, dto })
    });
  }

  async createSetupSession (dto: CreateSetupSessionDto): Promise<SetupSessionResultDto> {
    if (!this.stripe) throw new InternalServerErrorException('Stripe client not initialized');
    return StripeMethodHelper.createSetupSession({ client: this.stripe, session: dto });
  }

  async retrieveSessionPaymentMethod ({ sessionId }: RetrieveSessionDto): Promise<ProviderMethodResultDto> {
    if (!this.stripe) throw new InternalServerErrorException('Stripe client not initialized');
    return StripeMethodHelper.retrieveSessionMethod({ client: this.stripe, sessionId });
  }

  protected override classifyError (dto: ClassifyErrorDto): ProviderError {
    return StripeErrorMapper.toProviderError(dto);
  }

  private async stripeOperation ({ prefix, amount, currency, operation }: ExecuteOperationDto): Promise<ProviderChargeResultDto> {
    if (!this.stripe) return this.buildSimulatedResult({ prefix, amount, currency });

    return this.executeOperation({
      prefix,
      amount,
      currency,
      operation: async () => {
        StripeAmountHelper.assertChargeable({ amountMinor: amount, currency });
        return operation();
      }
    });
  }
}
