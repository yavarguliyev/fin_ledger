import { PaymentMethodStatus, PaymentStatus, RawBodyRequest } from '@common/libs';

export type HandleWebhookDto = { req: RawBodyRequest; query: HandleWebhookParamsHeaders };

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

export type HandleWebhookParamsHeaders = { providerParam: string; stripeSignature?: string; customSignature?: string };
