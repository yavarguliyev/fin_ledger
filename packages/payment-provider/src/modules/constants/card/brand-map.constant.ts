import { CardBrand } from '@common/shared-libs';

export const BRAND_MAP: Record<string, CardBrand> = {
  visa: CardBrand.VISA,
  mastercard: CardBrand.MASTERCARD,
  master: CardBrand.MASTERCARD,
  amex: CardBrand.AMEX,
  american_express: CardBrand.AMEX,
  'american express': CardBrand.AMEX,
  discover: CardBrand.DISCOVER
};
