export class CurrencyHelper {
  static toMinor (amount: number, currency: string): number {
    return Math.round(amount * 10 ** CurrencyHelper.fractionDigits(currency));
  }

  static fromMinor (amountMinor: number, currency: string): number {
    return amountMinor / 10 ** CurrencyHelper.fractionDigits(currency);
  }

  static formatCurrency (amountMinor: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(CurrencyHelper.fromMinor(amountMinor, currency));
  }

  static formatCurrencyCompact (amountMinor: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, notation: 'compact', maximumFractionDigits: 1 }).format(
      CurrencyHelper.fromMinor(amountMinor, currency)
    );
  }

  private static fractionDigits (currency: string): number {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).resolvedOptions().maximumFractionDigits ?? 2;
  }
}
