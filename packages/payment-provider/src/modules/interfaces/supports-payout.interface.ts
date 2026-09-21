import { PayoutFundsDto } from '../dtos/operation/payout-funds.dto';
import { ProviderChargeResultDto } from '../dtos/operation/provider-charge-result.dto';

export interface SupportsPayout {
  payout(dto: PayoutFundsDto): Promise<ProviderChargeResultDto>;
}
