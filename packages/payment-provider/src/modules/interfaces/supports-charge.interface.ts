import { ChargePaymentDto } from '../dtos/operation/charge-payment.dto';
import { RefundPaymentDto } from '../dtos/operation/refund-payment.dto';
import { ProviderChargeResultDto } from '../dtos/operation/provider-charge-result.dto';

export interface SupportsCharge {
  charge(dto: ChargePaymentDto): Promise<ProviderChargeResultDto>;
  refund(dto: RefundPaymentDto): Promise<ProviderChargeResultDto>;
}
