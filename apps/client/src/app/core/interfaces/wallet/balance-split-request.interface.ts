import { AvailableBalanceMinor } from '../base/available-balance-minor.interface';
import { ReservedBalanceMinor } from '../base/reserved-balance-minor.interface';

export interface BalanceSplitDto {
  wallet: AvailableBalanceMinor & ReservedBalanceMinor;
}
