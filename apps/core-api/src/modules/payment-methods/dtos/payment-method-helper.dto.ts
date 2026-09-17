import { CardBrand, PaymentProvider, ProviderMethodResultDto } from '@common/libs';
import { CreatePaymentMethod } from './request/create-payment-method.dto';

export type BuildProviderMethodDetailsDto = {
  dto: CreatePaymentMethod;
};

export type BuildPaymentMethodEntityDto = {
  dto: CreatePaymentMethod;
  providerResult: ProviderMethodResultDto;
  maskedAccount: string;
  detectedBrand: CardBrand;
  providerName: PaymentProvider;
};
