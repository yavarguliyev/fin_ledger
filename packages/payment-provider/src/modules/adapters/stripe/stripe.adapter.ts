import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PaymentCapability, PaymentProvider, ProviderError } from '@common/shared-libs';

import { ChargePaymentDto } from '../../dtos/operation/charge-payment.dto';
import { PayoutFundsDto } from '../../dtos/operation/payout-funds.dto';
import { ProviderChargeResultDto } from '../../dtos/operation/provider-charge-result.dto';
import { ProviderMethodResultDto } from '../../dtos/operation/provider-method-result.dto';
import { RefundPaymentDto } from '../../dtos/operation/refund-payment.dto';
import { RetrieveChargeDto } from '../../dtos/operation/retrieve-charge.dto';
import { FindChargeByMetadataDto } from '../../dtos/operation/find-charge-by-metadata.dto';
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
import { StripeSimulationHelper } from './helpers/stripe-simulation.helper';
import { STRIPE_SIMULATION } from '../../constants/stripe/stripe-simulated-outcomes.constant';
import { STRIPE_ERROR_DEFAULTS } from '../../constants/stripe/stripe-error-defaults.constant';
import { STRIPE_HEADERS } from '../../constants/stripe/stripe-headers.constant';

@Injectable()
export class StripeAdapter
  extends BasePaymentAdapter
  implements SupportsCharge, SupportsPayout, SupportsMethodVault, SupportsHostedSetup, SupportsWebhooks
{
  readonly providerName = PaymentProvider.STRIPE;

  readonly capabilities = [PaymentCapability.CHARGE, PaymentCapability.PAYOUT, PaymentCapability.METHOD_VAULT, PaymentCapability.HOSTED_SETUP, PaymentCapability.WEBHOOKS] as const;

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
    return this.headerValue({ headers, name: STRIPE_HEADERS.SIGNATURE });
  }

  constructWebhookEvent (dto: ConstructWebhookEventDto): Promise<WebhookEventDto> {
    return Promise.resolve().then(() => this.buildWebhookEvent(dto));
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
    if (!this.stripe) return Promise.resolve(StripeSimulationHelper.charge({ dto, provider: this.providerName }));
    return this.stripeOperation({
      prefix: STRIPE_SIMULATION.CHARGE_PREFIX,
      amount: dto.amount,
      currency: dto.currency,
      operation: async () => StripeOperationHelper.createCharge({ client: this.stripe!, dto })
    });
  }

  async retrieveCharge (dto: RetrieveChargeDto): Promise<ProviderChargeResultDto> {
    if (!this.stripe) return Promise.resolve(StripeSimulationHelper.retrieveCharge({ dto, provider: this.providerName }));
    const { CHARGE_PREFIX: prefix, UNKNOWN_AMOUNT: amount, UNKNOWN_CURRENCY: currency } = STRIPE_SIMULATION;
    return this.executeOperation({ prefix, amount, currency, operation: async () => StripeOperationHelper.retrieveCharge({ client: this.stripe!, dto }) });
  }

  async findChargeByMetadata (dto: FindChargeByMetadataDto): Promise<ProviderChargeResultDto | null> {
    const intentId = this.stripe ? await StripeOperationHelper.findIntentId({ client: this.stripe, dto }) : null;
    return intentId ? this.retrieveCharge({ chargeId: intentId }) : null;
  }

  async payout (dto: PayoutFundsDto): Promise<ProviderChargeResultDto> {
    const { amount, currency } = dto;
    return this.stripeOperation({ prefix: STRIPE_SIMULATION.PAYOUT_PREFIX, amount, currency, operation: async () => StripeOperationHelper.createPayout({ client: this.stripe!, dto }) });
  }

  async refund (dto: RefundPaymentDto): Promise<ProviderChargeResultDto> {
    const { amount, currency } = dto;
    return this.stripeOperation({ prefix: STRIPE_SIMULATION.REFUND_PREFIX, amount, currency, operation: async () => StripeOperationHelper.createRefund({ client: this.stripe!, dto }) });
  }

  async createSetupSession (dto: CreateSetupSessionDto): Promise<SetupSessionResultDto> {
    if (!this.stripe) throw new InternalServerErrorException(STRIPE_ERROR_DEFAULTS.CLIENT_NOT_INITIALIZED);
    return StripeMethodHelper.createSetupSession({ client: this.stripe, session: dto });
  }

  async retrieveSessionPaymentMethod ({ sessionId }: RetrieveSessionDto): Promise<ProviderMethodResultDto> {
    if (!this.stripe) throw new InternalServerErrorException(STRIPE_ERROR_DEFAULTS.CLIENT_NOT_INITIALIZED);
    return StripeMethodHelper.retrieveSessionMethod({ client: this.stripe, sessionId });
  }

  protected override classifyError (dto: ClassifyErrorDto): ProviderError {
    return StripeErrorMapper.toProviderError(dto);
  }

  private buildWebhookEvent (dto: ConstructWebhookEventDto): WebhookEventDto {
    if (!this.stripe || !this.webhookSecret) {
      if (!this.isSimulated) throw new UnauthorizedException(STRIPE_ERROR_DEFAULTS.UNVERIFIABLE_WEBHOOK);
      return this.simulateWebhook(dto);
    }

    return StripeWebhookHelper.verify({ ...dto, client: this.stripe, secret: this.webhookSecret });
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
