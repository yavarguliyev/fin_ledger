import { CardBrand } from '../enums/common/payment.enum';
import { detectCardBrand } from './detect-card-brand.helper';

export const formatAndSplitCardNumber = (cardNumber: string): string => {
  const sanitized = cardNumber.replace(/[\s-]/g, '');
  const brand = detectCardBrand(sanitized);

  if (brand === CardBrand.AMEX) {
    const p1 = sanitized.substring(0, 4);
    const p2 = sanitized.substring(4, 10);
    const p3 = sanitized.substring(10, 15);
    return [p1, p2, p3].filter(Boolean).join(' ');
  }

  const parts = sanitized.match(/.{1,4}/g);
  return parts ? parts.join(' ') : sanitized;
};
