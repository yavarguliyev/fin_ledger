import { PaymentMethodStatus, PaymentStatus, RawBodyRequest } from '@common/libs';

export type HandleWebhookParamsHeaders = {
  provider: string;
  'stripe-signature'?: string;
  stripeSignature?: string;
  'x-custom-signature'?: string;
  customSignature?: string;
};

export type HandleWebhookDto = {
  req: RawBodyRequest;
  query: HandleWebhookParamsHeaders;
};

export type HandlePaymentChargeEventInput = {
  provider: string;
  payload: Record<string, unknown>;
  status: PaymentStatus;
};

export type HandlePaymentMethodEventInput = {
  provider: string;
  payload: Record<string, unknown>;
  status: PaymentMethodStatus;
};

export type ProcessWebhookResult = {
  received: boolean;
  eventId?: string;
};
