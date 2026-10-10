import { BALANCE_HERO } from '../../constants/wallet/balance-hero.constant';
import { BalanceSplit } from '../../interfaces/wallet/balance-split.interface';
import { BalanceSplitDto } from '../../interfaces/wallet/balance-split-request.interface';

export class BalanceSplitHelper {
  static split ({ wallet }: BalanceSplitDto): BalanceSplit {
    const total = wallet.availableBalanceMinor + wallet.reservedBalanceMinor;
    if (total <= 0) return { availablePercent: 0, reservedPercent: 0 };

    const availablePercent = (wallet.availableBalanceMinor / total) * BALANCE_HERO.FULL_SHARE_PERCENT;
    return { availablePercent, reservedPercent: BALANCE_HERO.FULL_SHARE_PERCENT - availablePercent };
  }
}
