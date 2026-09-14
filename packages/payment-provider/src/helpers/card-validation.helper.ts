import { detectCardBrand, PaymentMethodType, validateLuhn } from '@common/shared-libs';

import { ProviderMethodDetailsDto } from '../dtos/provider-method-details.dto';
import { CardValidationResult } from '../dtos/charge-payment.dto';

const isInvalidCvv = (cvv: string | undefined): boolean => {
  if (!cvv) return false;
  return !/^\d{3,4}$/.test(cvv);
};

const isCardExpired = (month: number | undefined, year: number | undefined): boolean => {
  if (month === undefined || year === undefined) return false;
  const now = new Date();
  const currentYear = now.getFullYear();
  if (year < currentYear) return true;
  if (year > currentYear) return false;
  return month < now.getMonth() + 1;
};

export const validateCardDetails = (details: ProviderMethodDetailsDto): CardValidationResult => {
  const isCard = details.type === PaymentMethodType.CREDIT_CARD || details.type === PaymentMethodType.DEBIT_CARD;
  if (!isCard) return { isValid: true };

  const raw = (details.cardNumber ?? '').replace(/\D/g, '');
  const brand = raw ? detectCardBrand(raw) : undefined;

  if (raw && !validateLuhn(raw)) {
    return { isValid: false, failureReason: 'Invalid card number checksum (Luhn check failed)', brand };
  }

  if (isInvalidCvv(details.cvv ?? details.cvc)) {
    return { isValid: false, failureReason: 'Invalid CVV/CVC code', brand };
  }

  if (isCardExpired(details.expiryMonth ?? details.expMonth, details.expiryYear ?? details.expYear)) {
    return { isValid: false, failureReason: 'Card has expired', brand };
  }

  return { isValid: true, brand };
};
