import { CardBrand } from '../models/base.mode';

export const getMaxCardLength = (brand: CardBrand): number => {
  return brand === 'amex' ? 15 : 16;
};
