import { sanitize } from './card-validation.helper';

export const maskCardNumber = (cardNumber: string): string => {
  const last4 = sanitize(cardNumber).slice(-4);
  return `**** **** **** ${last4}`;
};
