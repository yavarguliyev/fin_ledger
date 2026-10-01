import { CURRENCY } from '../../constants/wallet/currency.constant';
import { CurrencyAmountDto } from '../../dtos/wallet/currency-amount.dto';
import { CurrencyRefDto } from '../../dtos/wallet/currency-ref.dto';
import { MinorAmountDto } from '../../dtos/wallet/minor-amount.dto';

export class CurrencyHelper {
  static toMinor ({ amount, currency = CURRENCY.DEFAULT }: CurrencyAmountDto): number {
    return Math.round(amount * CURRENCY.MINOR_BASE ** CurrencyHelper.fractionDigits({ currency }));
  }

  static fromMinor ({ amountMinor, currency = CURRENCY.DEFAULT }: MinorAmountDto): number {
    return amountMinor / CURRENCY.MINOR_BASE ** CurrencyHelper.fractionDigits({ currency });
  }

  static formatCurrency ({ amountMinor, currency = CURRENCY.DEFAULT }: MinorAmountDto): string {
    return new Intl.NumberFormat(CURRENCY.LOCALE, { style: CURRENCY.STYLE, currency }).format(CurrencyHelper.fromMinor({ amountMinor, currency }));
  }

  static formatCurrencyCompact ({ amountMinor, currency = CURRENCY.DEFAULT }: MinorAmountDto): string {
    return new Intl.NumberFormat(CURRENCY.LOCALE, {
      style: CURRENCY.STYLE,
      currency,
      notation: CURRENCY.COMPACT_NOTATION,
      maximumFractionDigits: CURRENCY.COMPACT_MAX_FRACTION_DIGITS
    }).format(CurrencyHelper.fromMinor({ amountMinor, currency }));
  }

  private static fractionDigits ({ currency }: CurrencyRefDto): number {
    return (
      new Intl.NumberFormat(CURRENCY.LOCALE, { style: CURRENCY.STYLE, currency }).resolvedOptions().maximumFractionDigits ??
      CURRENCY.FALLBACK_FRACTION_DIGITS
    );
  }
}
