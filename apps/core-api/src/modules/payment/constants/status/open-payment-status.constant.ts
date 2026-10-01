import { PaymentStatus, ProviderChargeStatus } from '@common/libs';

export const OPEN_PAYMENT_STATUS: Readonly<Partial<Record<ProviderChargeStatus, PaymentStatus>>> = {
  [ProviderChargeStatus.PENDING]: PaymentStatus.PROCESSING,
  [ProviderChargeStatus.REQUIRES_ACTION]: PaymentStatus.REQUIRES_ACTION
};
