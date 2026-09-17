import { CardBrand } from '../models/base.model';

export const getMaxCardLength = (brand: CardBrand): number => {
  return brand === 'amex' ? 15 : 16;
};
