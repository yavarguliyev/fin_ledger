import type { PaymentMethodContract } from '@common/contracts';

export type PaymentMethod = PaymentMethodContract & {
  createdAt: string;
  updatedAt: string;
};
