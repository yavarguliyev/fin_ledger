import { CardBrand, CryptoHelper, PaymentMethodStatus, ProviderChargeStatus } from '@common/shared-libs';

import { ProviderChargeResultDto } from '../dtos/operation/provider-charge-result.dto';
import { ProviderMethodResultDto } from '../dtos/operation/provider-method-result.dto';
import { NormalizeBrandDto } from '../dtos/helper/normalize-brand.dto';
import { NotFoundMethodDto } from '../dtos/helper/not-found-method.dto';
import { FailedMethodDto } from '../dtos/adapter/failed-method.dto';
import { FailedOperationDto } from '../dtos/adapter/failed-operation.dto';
import { DescribeFailureDto } from '../dtos/helper/describe-failure.dto';
import { OperationResultRefDto } from '../dtos/helper/operation-result-ref.dto';
import { ProviderFailureDto } from '../dtos/operation/provider-failure.dto';
import { MapVerifiedMethodDto } from '../dtos/adapter/map-verified-method.dto';
import { SimulatedChargeDto } from '../dtos/adapter/simulated-charge.dto';
import { BRAND_MAP } from '../constants/card/brand-map.constant';
import { PROVIDER_RESULT_DEFAULTS } from '../constants/result/provider-result-defaults.constant';

export class ProviderResultHelper {
  static normalizeBrand ({ brand }: NormalizeBrandDto): CardBrand {
    if (!brand) return CardBrand.UNKNOWN;
    return BRAND_MAP[brand.toLowerCase().trim()] ?? CardBrand.UNKNOWN;
  }

  static buildNotFoundResult ({ token, provider }: NotFoundMethodDto): ProviderMethodResultDto {
    return {
      paymentMethodToken: token,
      status: PaymentMethodStatus.REJECTED,
      failureReason: 'Payment method not found at provider',
      rawResponse: { provider, verified: false }
    };
  }

  static simulatedCharge ({ prefix, amount, currency, provider }: SimulatedChargeDto): ProviderChargeResultDto {
    return {
      chargeId: `${prefix}_${CryptoHelper.uuid()}`,
      status: ProviderChargeStatus.SUCCEEDED,
      amount,
      currency,
      rawResponse: { provider, simulated: true }
    };
  }

  static failedOperation ({ prefix, amount, currency, failure }: FailedOperationDto): ProviderChargeResultDto {
    return {
      chargeId: `${prefix}_failed_${CryptoHelper.uuid()}`,
      status: failure.indeterminate ? ProviderChargeStatus.INDETERMINATE : ProviderChargeStatus.FAILED,
      amount,
      currency,
      failureReason: failure.message,
      failure: ProviderResultHelper.describeFailure({ failure })
    };
  }

  static fromOperation ({ result }: OperationResultRefDto): ProviderChargeResultDto {
    return {
      chargeId: result.id,
      status: result.status,
      amount: result.amount ?? PROVIDER_RESULT_DEFAULTS.UNKNOWN_AMOUNT,
      currency: (result.currency ?? PROVIDER_RESULT_DEFAULTS.UNKNOWN_CURRENCY).toUpperCase(),
      ...(result.failure && { failure: result.failure, failureReason: result.failure.message })
    };
  }

  static describeFailure ({ failure }: DescribeFailureDto): ProviderFailureDto {
    return {
      code: failure.code,
      category: failure.category,
      message: failure.message,
      retryable: failure.retryable,
      indeterminate: failure.indeterminate
    };
  }

  static failedMethod ({ token, message, walletType }: FailedMethodDto): ProviderMethodResultDto {
    return {
      paymentMethodToken: token || `pm_failed_${CryptoHelper.uuid()}`,
      status: PaymentMethodStatus.REJECTED,
      walletType,
      failureReason: message
    };
  }

  static verifiedMethod (details: MapVerifiedMethodDto): ProviderMethodResultDto {
    const { token, brand, methodType, last4, expMonth, expYear, fingerprint, billingName, walletType, rawResponse } = details;

    return {
      paymentMethodToken: token,
      status: PaymentMethodStatus.VERIFIED,
      brand,
      methodType,
      last4,
      expMonth,
      expYear,
      fingerprint,
      billingName,
      walletType,
      rawResponse
    };
  }
}
