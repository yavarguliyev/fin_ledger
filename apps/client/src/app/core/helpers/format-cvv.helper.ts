import { CardBrand } from '../models/base.model';
import { getMaxCvvLength } from './get-max-cvv-length.helper';

export const formatCvv = (raw: string, brand: CardBrand): string => {
  const digits = raw.replace(/\D/g, '');
  const max = getMaxCvvLength(brand);
  return digits.substring(0, max);
};
