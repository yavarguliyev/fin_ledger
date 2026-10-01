import { CurrencyHelper } from '../../../src/app/core/helpers/wallet/currency.helper';

const USD = 'USD';
const JPY = 'JPY';
const KWD = 'KWD';

describe('CurrencyHelper', () => {
  it('scales a two-decimal currency by a hundred', () => {
    expect(CurrencyHelper.toMinor({ amount: 12.34, currency: USD })).toBe(1234);
    expect(CurrencyHelper.fromMinor({ amountMinor: 1234, currency: USD })).toBe(12.34);
  });

  it('does not scale a zero-decimal currency, so yen is never off by a hundred', () => {
    expect(CurrencyHelper.toMinor({ amount: 1500, currency: JPY })).toBe(1500);
    expect(CurrencyHelper.fromMinor({ amountMinor: 1500, currency: JPY })).toBe(1500);
  });

  it('scales a three-decimal currency by a thousand', () => {
    expect(CurrencyHelper.toMinor({ amount: 1.234, currency: KWD })).toBe(1234);
    expect(CurrencyHelper.fromMinor({ amountMinor: 1234, currency: KWD })).toBe(1.234);
  });

  it('rounds rather than truncates, so a half minor unit does not vanish', () => {
    expect(CurrencyHelper.toMinor({ amount: 0.005, currency: USD })).toBe(1);
    expect(CurrencyHelper.toMinor({ amount: 0.004, currency: USD })).toBe(0);
  });

  it('falls back to the default currency when none is given', () => {
    expect(CurrencyHelper.toMinor({ amount: 1 })).toBe(100);
    expect(CurrencyHelper.fromMinor({ amountMinor: 100 })).toBe(1);
  });

  it('formats each currency with its own number of decimals', () => {
    expect(CurrencyHelper.formatCurrency({ amountMinor: 1234, currency: USD })).toContain('12.34');
    expect(CurrencyHelper.formatCurrency({ amountMinor: 1500, currency: JPY })).toContain('1,500');
    expect(CurrencyHelper.formatCurrency({ amountMinor: 1234, currency: KWD })).toContain('1.234');
  });

  it('shortens large amounts for the stat tiles', () => {
    expect(CurrencyHelper.formatCurrencyCompact({ amountMinor: 250_000_00 })).toContain('250K');
  });
});
