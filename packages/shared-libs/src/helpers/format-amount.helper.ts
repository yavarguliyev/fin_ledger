export const formatAmount = (amountMinor: number, currency: string): string => {
  return `${(amountMinor / 100).toFixed(2)} ${currency}`;
};
