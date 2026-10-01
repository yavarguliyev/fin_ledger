import { PaymentProvider } from '@common/shared-libs';

export interface SimulatedWebhook {
  parsed: Record<string, unknown>;
  provider: PaymentProvider;
  signature: string;
}
