import { Logger } from '@nestjs/common';
import { BaseHelper, CircuitBreaker, CryptoHelper, PaymentCapability, PaymentProvider, ProviderChargeStatus, ProviderError, ProviderErrorCategory } from '@common/shared-libs';

import { PaymentProviderCore } from '../../interfaces/payment-provider-core.interface';
import { ProviderChargeResultDto } from '../../dtos/operation/provider-charge-result.dto';
import { ProviderMethodResultDto } from '../../dtos/operation/provider-method-result.dto';
import { WebhookEventDto } from '../../dtos/operation/webhook-event.dto';
import { VerifyPaymentMethodDto } from '../../dtos/contract/verify-payment-method.dto';
import { ConstructWebhookEventDto } from '../../dtos/contract/construct-webhook-event.dto';
import { CreateFailedMethodDto } from '../../dtos/adapter/create-failed-method.dto';
import { CreateFailedOperationDto } from '../../dtos/adapter/create-failed-operation.dto';
import { ExecuteMethodOperationDto } from '../../dtos/adapter/execute-method-operation.dto';
import { ExecuteOperationDto } from '../../dtos/adapter/execute-operation.dto';
import { MapVerifiedMethodDto } from '../../dtos/adapter/map-verified-method.dto';
import { HeaderValueDto } from '../../dtos/adapter/header-value.dto';
import { RawPayloadDto } from '../../dtos/adapter/raw-payload.dto';
import { SimulatedResultDto } from '../../dtos/adapter/simulated-result.dto';
import { ClassifyErrorDto } from '../../dtos/adapter/classify-error.dto';
import { AdapterCredentialsDto } from '../../dtos/adapter/adapter-credentials.dto';
import { EnvValueDto } from '../../dtos/helper/env-value.dto';
import { AdapterNameDto } from '../../dtos/adapter/adapter-name.dto';
import { CapabilityDto } from '../../dtos/contract/capability.dto';
import { ProviderResultHelper } from '../../helpers/provider-result.helper';
import { ProviderConfigHelper } from '../../helpers/provider-config.helper';

export abstract class BasePaymentAdapter implements PaymentProviderCore {
  protected readonly logger: Logger;
  protected readonly breaker: CircuitBreaker;

  abstract readonly providerName: PaymentProvider;
  abstract readonly capabilities: readonly PaymentCapability[];

  constructor ({ name }: AdapterNameDto) {
    this.logger = new Logger(name);
    this.breaker = new CircuitBreaker({ name });
  }

  supports ({ capability }: CapabilityDto): boolean {
    return this.capabilities.includes(capability);
  }

  verifyPaymentMethod ({ paymentMethodToken }: VerifyPaymentMethodDto): Promise<ProviderMethodResultDto> {
    return Promise.resolve(ProviderResultHelper.buildNotFoundResult({ token: paymentMethodToken, provider: this.providerName }));
  }

  protected headerValue ({ headers, name }: HeaderValueDto): string {
    const value = headers[name] ?? headers[name.toLowerCase()];
    if (Array.isArray(value)) return value[0] ?? '';
    return value ?? '';
  }

  protected getEnvValue (dto: EnvValueDto): string | undefined {
    return ProviderConfigHelper.getValue(dto);
  }

  protected requireCredentials ({ configService, keys }: AdapterCredentialsDto): boolean {
    return ProviderConfigHelper.requireCredentials({ configService, keys, providerName: this.constructor.name, logger: this.logger });
  }

  protected parseRawPayload ({ payload }: RawPayloadDto): Record<string, unknown> {
    const raw = typeof payload === 'string' ? payload : payload.toString('utf-8');

    try {
      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new SyntaxError('payload is not a JSON object');

      return parsed as Record<string, unknown>;
    } catch (error) {
      throw new ProviderError({
        message: `${this.providerName} webhook payload is not valid JSON: ${BaseHelper.errorResponse({ error }).message}`,
        category: ProviderErrorCategory.INVALID_REQUEST
      });
    }
  }

  protected async executeMethodOperation ({ token, walletType, operation }: ExecuteMethodOperationDto): Promise<ProviderMethodResultDto> {
    try {
      return await operation();
    } catch (error: unknown) {
      return this.createFailedMethod({ token, error, walletType });
    }
  }

  protected simulateWebhook ({ payload, signature }: ConstructWebhookEventDto): WebhookEventDto {
    const parsed = this.parseRawPayload({ payload });
    const eventId = typeof parsed['id'] === 'string' ? parsed['id'] : `evt_${CryptoHelper.uuid()}`;
    const eventType = typeof parsed['type'] === 'string' ? parsed['type'] : 'payment.unknown';

    return { eventId, eventType, provider: this.providerName, payload: parsed, signature, signatureVerified: false };
  }

  protected buildSimulatedResult (dto: SimulatedResultDto): ProviderChargeResultDto {
    return ProviderResultHelper.simulatedCharge({ ...dto, provider: this.providerName });
  }

  protected createFailedMethod ({ token, error, walletType }: CreateFailedMethodDto): ProviderMethodResultDto {
    return ProviderResultHelper.failedMethod({ token, message: this.classifyError({ error }).message, walletType });
  }

  protected classifyError ({ error }: ClassifyErrorDto): ProviderError {
    if (error instanceof ProviderError) return error;

    return new ProviderError({ message: BaseHelper.errorResponse({ error }).message, category: ProviderErrorCategory.UNKNOWN });
  }

  protected createFailedOperation ({ prefix, amount, currency, error }: CreateFailedOperationDto): ProviderChargeResultDto {
    return ProviderResultHelper.failedOperation({ prefix, amount, currency, failure: this.classifyError({ error }) });
  }

  protected mapVerifiedMethod (details: MapVerifiedMethodDto): ProviderMethodResultDto {
    return ProviderResultHelper.verifiedMethod(details);
  }

  protected async executeOperation ({ prefix, amount, currency, operation }: ExecuteOperationDto): Promise<ProviderChargeResultDto> {
    if (this.breaker.isOpen) {
      const blocked = new ProviderError({
        message: `${this.providerName} is temporarily unavailable; no request was sent`,
        category: ProviderErrorCategory.CIRCUIT_OPEN
      });

      return this.createFailedOperation({ prefix, amount, currency, error: blocked });
    }

    try {
      const res = await operation();
      const result = typeof res === 'string' ? { id: res, status: ProviderChargeStatus.SUCCEEDED } : res;

      this.breaker.recordSuccess();

      return {
        chargeId: result.id,
        status: result.status,
        amount: result.amount ?? amount,
        currency: (result.currency ?? currency).toUpperCase(),
        ...(result.failure && { failure: result.failure, failureReason: result.failure.message }),
        ...(result.clientSecret && { clientSecret: result.clientSecret })
      };
    } catch (error: unknown) {
      const failure = this.classifyError({ error });
      this.breaker.recordFailure({ retryable: failure.retryable });

      return this.createFailedOperation({ prefix, amount, currency, error: failure });
    }
  }
}
