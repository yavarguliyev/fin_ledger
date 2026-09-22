import { PaymentMethod } from '../../../../core/interfaces/payment-method/payment-method.interface';

export class PaymentMethodHelper {
  static getBrandLabel (brand: string | null | undefined): string {
    if (!brand || brand === 'unknown') return '';
    return brand.charAt(0).toUpperCase() + brand.slice(1);
  }

  static getPaymentMethodLabel (method: PaymentMethod): string {
    if (method.brand && method.brand !== 'unknown') {
      return PaymentMethodHelper.getBrandLabel(method.brand);
    }

    if (method.walletType === 'apple_pay') return 'Apple Pay';
    if (method.walletType === 'google_pay') return 'Google Pay';
    if (method.bankName) return method.bankName;
    if (method.type === 'BANK_ACCOUNT') return 'Bank Account';

    return 'Card';
  }
}
