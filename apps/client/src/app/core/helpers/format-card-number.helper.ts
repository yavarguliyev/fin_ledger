import { sanitize, GROUP_PATTERN } from './card-validation.helper';
import { detectCardBrand } from './detect-card-brand.helper';

export const formatCardNumber = (cardNumber: string): string => {
  const digits = sanitize(cardNumber);
  const brand = detectCardBrand(digits);

  if (brand === 'amex') {
    const p1 = digits.substring(0, 4);
    const p2 = digits.substring(4, 10);
    const p3 = digits.substring(10, 15);
    return [p1, p2, p3].filter(Boolean).join(' ');
  }

  const parts = digits.match(GROUP_PATTERN);
  return parts ? parts.join(' ') : digits;
};
