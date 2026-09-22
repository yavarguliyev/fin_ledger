import { PaymentStatus } from '@common/libs';

export const PAYMENT_TRANSITIONS: Readonly<Record<PaymentStatus, readonly PaymentStatus[]>> = {
  [PaymentStatus.CANCELLED]: [PaymentStatus.PENDING, PaymentStatus.REQUIRES_ACTION],
  [PaymentStatus.COMPENSATED]: [PaymentStatus.PENDING, PaymentStatus.PROCESSING, PaymentStatus.REQUIRES_ACTION, PaymentStatus.COMPLETED],
  [PaymentStatus.COMPLETED]: [PaymentStatus.PENDING, PaymentStatus.PROCESSING, PaymentStatus.REQUIRES_ACTION],
  [PaymentStatus.FAILED]: [PaymentStatus.PENDING, PaymentStatus.PROCESSING, PaymentStatus.REQUIRES_ACTION],
  [PaymentStatus.PENDING]: [],
  [PaymentStatus.PROCESSING]: [PaymentStatus.PENDING],
  [PaymentStatus.REQUIRES_ACTION]: [PaymentStatus.PENDING, PaymentStatus.PROCESSING]
};
