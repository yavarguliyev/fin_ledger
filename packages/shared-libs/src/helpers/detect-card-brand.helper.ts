import { CardBrand } from '../enums/common/payment.enum';

export const detectCardBrand = (cardNumber: string): CardBrand => {
  const sanitized = cardNumber.replace(/[\s-]/g, '');

  if (/^4/.test(sanitized)) return CardBrand.VISA;
  if (/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[01]|2720)/.test(sanitized)) return CardBrand.MASTERCARD;
  if (/^3[47]/.test(sanitized)) return CardBrand.AMEX;
  if (/^(6011|65|64[4-9]|622)/.test(sanitized)) return CardBrand.DISCOVER;

  return CardBrand.UNKNOWN;
};
