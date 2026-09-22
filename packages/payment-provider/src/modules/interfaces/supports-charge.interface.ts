import { ChargePaymentDto } from '../dtos/operation/charge-payment.dto';
import { RefundPaymentDto } from '../dtos/operation/refund-payment.dto';
import { ProviderChargeResultDto } from '../dtos/operation/provider-charge-result.dto';
import { RetrieveChargeDto } from '../dtos/operation/retrieve-charge.dto';
import { FindChargeByMetadataDto } from '../dtos/operation/find-charge-by-metadata.dto';

export interface SupportsCharge {
  charge(dto: ChargePaymentDto): Promise<ProviderChargeResultDto>;
  refund(dto: RefundPaymentDto): Promise<ProviderChargeResultDto>;
  retrieveCharge(dto: RetrieveChargeDto): Promise<ProviderChargeResultDto>;
  findChargeByMetadata(dto: FindChargeByMetadataDto): Promise<ProviderChargeResultDto | null>;
}
