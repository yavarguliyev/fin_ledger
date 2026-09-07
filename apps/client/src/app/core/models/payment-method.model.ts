import { CreatedAt, Id, PaymentMethodStatus, PaymentMethodType, UpdatedAt, UserId } from './base.mode';

export interface CreatePaymentMethodRequest {
  type: PaymentMethodType;
  accountHolder: string;
  accountNumber: string;
  bankName?: string;
  isDefault?: boolean;
}

export interface PaymentMethod extends Id, UserId, CreatedAt, UpdatedAt {
  type: PaymentMethodType;
  accountHolder: string;
  maskedAccount: string;
  bankName: string | null;
  status: PaymentMethodStatus;
  isDefault: boolean;
  metadata?: Record<string, unknown> | null;
}
