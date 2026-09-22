import { CardBrand } from '../../types/payment-method/card-brand.type';
import { DigitalWalletType } from '../../types/payment-method/digital-wallet-type.type';
import { PaymentMethodStatus } from '../../types/payment-method/payment-method-status.type';
import { PaymentMethodType } from '../../types/payment-method/payment-method-type.type';
import { CreatedAt } from '../base/created-at.interface';
import { Id } from '../base/id.interface';
import { UpdatedAt } from '../base/updated-at.interface';
import { UserId } from '../base/user-id.interface';

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
