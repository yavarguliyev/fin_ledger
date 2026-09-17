import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v7 as uuid } from 'uuid';
import { BaseHelper, PaymentMethodStatus, PaymentProvider, ProviderChargeStatus } from '@common/shared-libs';

import { IPaymentProvider, NormalizedCardDetails } from '../../interfaces/payment-provider.interface';
import { ChargePaymentDto } from '../../dtos/charge-payment.dto';
import { PayoutFundsDto } from '../../dtos/payout-funds.dto';
import { RefundPaymentDto } from '../../dtos/refund-payment.dto';
import { ProviderChargeResultDto } from '../../dtos/provider-charge-result.dto';
import { ProviderMethodDetailsDto } from '../../dtos/provider-method-details.dto';
import { ProviderMethodResultDto } from '../../dtos/provider-method-result.dto';
import { WebhookEventDto } from '../../dtos/webhook-event.dto';
import { PaymentProviderHelper } from '../../helpers/payment-provider.helper';
import {
  CreateFailedMethodDto,
  CreateFailedOperationDto,
  ExecuteMethodOperationDto,
  ExecuteOperationDto,
  MapVerifiedMethodDto
} from '../../dtos/base-payment.dto';

export abstract class BasePaymentAdapter implements IPaymentProvider {
  protected readonly logger: Logger;
  protected readonly paymentMethods = new Map<string, ProviderMethodResultDto>();

  abstract readonly providerName: PaymentProvider;

  constructor (name: string) {
    this.logger = new Logger(name);
  }

  abstract charge(dto: ChargePaymentDto): Promise<ProviderChargeResultDto>;
  abstract payout(dto: PayoutFundsDto): Promise<ProviderChargeResultDto>;
  abstract refund(dto: RefundPaymentDto): Promise<ProviderChargeResultDto>;
  abstract constructWebhookEvent(payload: Buffer | string, signature: string): Promise<WebhookEventDto>;

  verifyPaymentMethod (paymentMethodToken: string): Promise<ProviderMethodResultDto> {
    const existing = this.paymentMethods.get(paymentMethodToken);
    if (existing) return Promise.resolve(existing);
    return Promise.resolve(PaymentProviderHelper.buildNotFoundResult({ token: paymentMethodToken, provider: this.providerName }));
  }

  protected getEnvValue (key: string, configService: ConfigService): string | undefined {
    const fromConfig = configService.get<string>(key);
    if (fromConfig && fromConfig.trim().length > 0) return fromConfig.trim();
    return undefined;
  }

  protected parseRawPayload (payload: Buffer | string): Record<string, unknown> {
    try {
      const raw = typeof payload === 'string' ? payload : payload.toString('utf-8');
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return {};
    }
  }

  protected async executeMethodOperation ({ token, walletType, operation }: ExecuteMethodOperationDto): Promise<ProviderMethodResultDto> {
    try {
      return await operation();
    } catch (error: unknown) {
      return this.createFailedMethod({ token, error, walletType });
    }
  }

  protected simulateWebhook (payload: Buffer | string, signature: string): WebhookEventDto {
    const parsed = this.parseRawPayload(payload);
    const eventId = typeof parsed['id'] === 'string' ? parsed['id'] : `evt_${uuid()}`;
    const eventType = typeof parsed['type'] === 'string' ? parsed['type'] : 'payment.succeeded';
    return { eventId, eventType, provider: this.providerName, payload: parsed, signature };
  }

  protected buildSimulatedResult (prefix: string, amount: number, currency: string): ProviderChargeResultDto {
    return {
      chargeId: `${prefix}_${uuid()}`,
      status: ProviderChargeStatus.SUCCEEDED,
      amount,
      currency,
      rawResponse: { provider: this.providerName, simulated: true }
    };
  }

  protected createFailedMethod ({ token, error, walletType }: CreateFailedMethodDto): ProviderMethodResultDto {
    return {
      paymentMethodToken: token || `pm_failed_${uuid()}`,
      status: PaymentMethodStatus.REJECTED,
      walletType,
      failureReason: BaseHelper.errorResponse({ error }).message,
      rawResponse: { error: BaseHelper.errorResponse({ error }).message }
    };
  }

  protected createFailedOperation ({ prefix, amount, currency, error }: CreateFailedOperationDto): ProviderChargeResultDto {
    return {
      chargeId: `${prefix}_failed_${uuid()}`,
      status: ProviderChargeStatus.FAILED,
      amount,
      currency,
      failureReason: BaseHelper.errorResponse({ error }).message,
      rawResponse: { error: BaseHelper.errorResponse({ error }).message }
    };
  }

  protected mapVerifiedMethod ({ token, brand, last4, walletType, rawResponse }: MapVerifiedMethodDto): ProviderMethodResultDto {
    return {
      paymentMethodToken: token,
      status: PaymentMethodStatus.VERIFIED,
      brand,
      last4,
      walletType,
      rawResponse
    };
  }

  protected extractCardDetails (details: ProviderMethodDetailsDto): NormalizedCardDetails {
    return {
      number: details.cardNumber || '',
      expMonth: details.expMonth ?? details.expiryMonth ?? 12,
      expYear: details.expYear ?? details.expiryYear ?? 2030,
      cvc: details.cvc ?? details.cvv ?? undefined,
      name: details.holderName || undefined
    };
  }

  protected async executeOperation ({ prefix, amount, currency, operation }: ExecuteOperationDto): Promise<ProviderChargeResultDto> {
    try {
      const res = await operation();
      const isStr = typeof res === 'string';
      const chargeId = isStr ? res : res.id;
      const status = isStr ? ProviderChargeStatus.SUCCEEDED : (res.status ?? ProviderChargeStatus.SUCCEEDED);
      return { chargeId, status, amount, currency: currency.toUpperCase() };
    } catch (error: unknown) {
      return this.createFailedOperation({ prefix, amount, currency, error });
    }
  }
}
