import { PaymentMethod } from '../../../../core/types/payment-method/payment-method.type';
import { PAYMENT_METHOD_LABELS } from '../../../../core/constants/payment/payment-method-labels.constant';
import { BrandRefDto } from '../../../../core/interfaces/payment/brand-ref.interface';
import { PaymentMethodRefDto } from '../../../../core/interfaces/payment/payment-method-ref.interface';
import { PaymentMethodListDto } from '../../../../core/interfaces/payment/payment-method-list.interface';
import { PAYMENT_METHOD_STATUS } from '../../../../core/constants/payment/payment-method-status.constant';

export class PaymentMethodHelper {
  static preferredVerified ({ methods }: PaymentMethodListDto): PaymentMethod | undefined {
    const verified = methods.filter(({ status }) => status === PAYMENT_METHOD_STATUS.VERIFIED);
    return verified.find(({ isDefault }) => isDefault) ?? verified[0];
  }

  static getBrandLabel ({ brand }: BrandRefDto): string {
    if (!brand || brand === PAYMENT_METHOD_LABELS.UNKNOWN_BRAND) return '';
    return brand.charAt(0).toUpperCase() + brand.slice(1);
  }

  static getPaymentMethodLabel ({ method }: PaymentMethodRefDto): string {
    const brand = PaymentMethodHelper.getBrandLabel({ brand: method.cardBrand });
    if (brand) return brand;

    if (method.walletType === PAYMENT_METHOD_LABELS.APPLE_PAY_TYPE) return PAYMENT_METHOD_LABELS.APPLE_PAY;
    if (method.walletType === PAYMENT_METHOD_LABELS.GOOGLE_PAY_TYPE) return PAYMENT_METHOD_LABELS.GOOGLE_PAY;
    if (method.bankName) return method.bankName;
    if (method.type === PAYMENT_METHOD_LABELS.BANK_ACCOUNT_TYPE) return PAYMENT_METHOD_LABELS.BANK_ACCOUNT;

    return PAYMENT_METHOD_LABELS.CARD;
  }

  static maskedAccount ({ method }: PaymentMethodRefDto): string {
    if (method.lastFour) return `${PAYMENT_METHOD_LABELS.MASK}${method.lastFour}`;
    return method.bankName ?? PaymentMethodHelper.getPaymentMethodLabel({ method });
  }
}
