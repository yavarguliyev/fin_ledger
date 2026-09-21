const fractionDigits = (currency: string): number => new Intl.NumberFormat('en-US', { style: 'currency', currency }).resolvedOptions().maximumFractionDigits ?? 2;

export const toMinor = (amount: number, currency: string): number => Math.round(amount * 10 ** fractionDigits(currency));

export const fromMinor = (amountMinor: number, currency: string): number => amountMinor / 10 ** fractionDigits(currency);

export const formatCurrency = (amountMinor: number, currency = 'USD'): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(fromMinor(amountMinor, currency));

export const formatCurrencyCompact = (amountMinor: number, currency = 'USD'): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, notation: 'compact', maximumFractionDigits: 1 }).format(fromMinor(amountMinor, currency));
