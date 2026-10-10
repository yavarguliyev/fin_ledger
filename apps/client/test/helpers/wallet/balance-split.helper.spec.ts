import { BalanceSplitHelper } from '../../../src/app/core/helpers/wallet/balance-split.helper';
import { BALANCE_HERO } from '../../../src/app/core/constants/wallet/balance-hero.constant';

describe('BalanceSplitHelper.split', () => {
  it('splits the bar between available and reserved money', () => {
    expect(BalanceSplitHelper.split({ wallet: { availableBalanceMinor: 7_500, reservedBalanceMinor: 2_500 } })).toEqual({ availablePercent: 75, reservedPercent: 25 });
  });

  it('fills the bar with available money when nothing is reserved', () => {
    expect(BalanceSplitHelper.split({ wallet: { availableBalanceMinor: 52_767, reservedBalanceMinor: 0 } })).toEqual({
      availablePercent: BALANCE_HERO.FULL_SHARE_PERCENT,
      reservedPercent: 0
    });
  });

  it('leaves the bar empty for an empty wallet', () => {
    expect(BalanceSplitHelper.split({ wallet: { availableBalanceMinor: 0, reservedBalanceMinor: 0 } })).toEqual({ availablePercent: 0, reservedPercent: 0 });
  });
});
