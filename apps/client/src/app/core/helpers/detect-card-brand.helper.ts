import { CardBrand } from '../models/base.model';
import { sanitize, VISA_PATTERN, MC_PATTERN, AMEX_PATTERN, DISCOVER_PATTERN } from './card-validation.helper';

export const detectCardBrand = (cardNumber: string): CardBrand => {
  const digits = sanitize(cardNumber);

  if (VISA_PATTERN.test(digits)) return 'visa';
  if (MC_PATTERN.test(digits)) return 'mastercard';
  if (AMEX_PATTERN.test(digits)) return 'amex';
  if (DISCOVER_PATTERN.test(digits)) return 'discover';

  return 'unknown';
};
