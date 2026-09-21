import { ProviderMethodResultDto } from '../dtos/operation/provider-method-result.dto';
import { VerifyPaymentMethodDto } from '../dtos/contract/verify-payment-method.dto';

export interface SupportsMethodVault {
  verifyPaymentMethod(dto: VerifyPaymentMethodDto): Promise<ProviderMethodResultDto>;
}
