import { AmountMinor } from '../base/amount-minor.interface';
import { Currency } from '../base/currency.interface';

export interface PaymentRequest extends AmountMinor, Currency {
  idempotencyKey: string;
  paymentMethodId?: string;
  metadata?: Record<string, string>;
}
