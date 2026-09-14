import { sanitize, CARD_LENGTH_PATTERN } from './card-validation.helper';

export const validateLuhn = (cardNumber: string): boolean => {
  const digits = sanitize(cardNumber);
  if (!CARD_LENGTH_PATTERN.test(digits)) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
};
