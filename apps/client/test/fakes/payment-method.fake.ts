import { PaymentMethod } from '../../src/app/core/types/payment-method/payment-method.type';
import { FAKES as F } from '../constants/fakes.constant';

export const aPaymentMethod = (overrides: Partial<PaymentMethod> = {}): PaymentMethod => ({
  id: F.ID,
  userId: F.USER_ID,
  type: F.CARD_TYPE,
  accountHolder: F.ACCOUNT_HOLDER,
  lastFour: F.LAST_FOUR,
  bankName: null,
  provider: F.PROVIDER,
  cardBrand: null,
  walletType: null,
  expiryMonth: null,
  expiryYear: null,
  status: F.VERIFIED,
  isDefault: false,
  metadata: null,
  createdAt: F.CREATED_AT,
  updatedAt: F.CREATED_AT,
  ...overrides
});
