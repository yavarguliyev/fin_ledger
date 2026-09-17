import Stripe from 'stripe';
import { PaymentProvider } from '@common/shared-libs';

import { ChargePaymentDto } from './charge-payment.dto';
import { CreateSetupSessionDto } from './setup-session.dto';
import { ProviderMethodDetailsDto } from './provider-method-details.dto';
import { NormalizedCardDetails } from '../interfaces/payment-provider.interface';

export type NormalizeBrandDto = {
  brand?: string | undefined;
};

export type NotFoundMethodDto = {
  token: string;
  provider: PaymentProvider;
};

export type GetOrCreateCustomerDto = {
  client: Stripe;
  email?: string | undefined;
};

export type ResolveCustomerChargeDto = {
  client: Stripe;
  dto: ChargePaymentDto;
};

export type CreateProviderSetupSessionDto = {
  client: Stripe;
  session: CreateSetupSessionDto;
};

export type RetrieveSessionMethodDto = {
  client: Stripe;
  sessionId: string;
};

export type BuildChargeParamsDto = {
  dto: ChargePaymentDto;
  customerId?: string | undefined;
};

export type ResolveProviderMethodDto = {
  client: Stripe;
  details: ProviderMethodDetailsDto;
  card: NormalizedCardDetails;
};
