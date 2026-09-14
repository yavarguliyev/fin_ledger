import { CardBrand, CreatedAt, DigitalWalletType, Id, PaymentMethodStatus, PaymentMethodType, UpdatedAt, UserId } from './base.mode';

export interface CreatePaymentMethodRequest {
  type: PaymentMethodType;
  accountHolder: string;
  accountNumber: string;
  bankName?: string;
  expiryMonth?: number;
  expiryYear?: number;
  cvv?: string;
  isDefault?: boolean;
}

export interface PaymentMethod extends Id, UserId, CreatedAt, UpdatedAt {
  type: PaymentMethodType;
  accountHolder: string;
  maskedAccount: string;
  bankName: string | null;
  status: PaymentMethodStatus;
  isDefault: boolean;
  brand: CardBrand | null;
  last4: string | null;
  walletType: DigitalWalletType | null;
  expiryMonth: number | null;
  expiryYear: number | null;
  metadata?: Record<string, unknown> | null;
}

export interface PaymentMethodOption {
  readonly type: PaymentMethodType;
  readonly label: string;
}
