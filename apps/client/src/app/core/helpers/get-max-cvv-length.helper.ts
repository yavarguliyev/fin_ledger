import { CardBrand } from '../models/base.model';

export const getMaxCvvLength = (brand: CardBrand): number => {
  return brand === 'amex' ? 4 : 3;
};
