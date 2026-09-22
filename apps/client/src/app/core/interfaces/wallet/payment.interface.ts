import { PaymentStatus } from '../../types/wallet/payment-status.type';
import { AmountMinor } from '../base/amount-minor.interface';
import { CreatedAt } from '../base/created-at.interface';
import { Currency } from '../base/currency.interface';
import { Id } from '../base/id.interface';

export interface Payment extends Id, CreatedAt, AmountMinor, Currency {
  status: PaymentStatus;
  provider?: string;
}
