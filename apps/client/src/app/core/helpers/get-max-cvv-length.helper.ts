import { CardBrand } from '../models/base.mode';

export const getMaxCvvLength = (brand: CardBrand): number => {
  return brand === 'amex' ? 4 : 3;
};
