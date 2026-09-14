import { PaymentMethod, PaymentMethodOption } from '../../../../core/models/payment-method.model';

export const PAYMENT_METHOD_OPTIONS: readonly PaymentMethodOption[] = [
  { type: 'BANK_ACCOUNT', label: 'Bank Account' },
  { type: 'CREDIT_CARD', label: 'Credit Card' },
  { type: 'DEBIT_CARD', label: 'Debit Card' },
  { type: 'APPLE_PAY', label: 'Apple Pay' },
  { type: 'GOOGLE_PAY', label: 'Google Pay' }
];

export const getBrandLabel = (brand: string | null | undefined): string => {
  if (!brand || brand === 'unknown') return '';
  return brand.charAt(0).toUpperCase() + brand.slice(1);
};

export const getPaymentMethodLabel = (method: PaymentMethod): string => {
  if (method.brand && method.brand !== 'unknown') {
    return getBrandLabel(method.brand);
  }

  if (method.walletType === 'apple_pay') return 'Apple Pay';
  if (method.walletType === 'google_pay') return 'Google Pay';
  if (method.bankName) return method.bankName;
  if (method.type === 'BANK_ACCOUNT') return 'Bank Account';

  return 'Card';
};
