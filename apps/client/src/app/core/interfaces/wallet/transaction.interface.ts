import { TransactionStatus } from '../../types/wallet/transaction-status.type';
import { TransactionType } from '../../types/wallet/transaction-type.type';
import { AmountMinor } from '../base/amount-minor.interface';
import { CreatedAt } from '../base/created-at.interface';
import { Currency } from '../base/currency.interface';
import { Id } from '../base/id.interface';
import { Reference } from '../base/reference.interface';
import { TransactionId } from '../base/transaction-id.interface';
import { UpdatedAt } from '../base/updated-at.interface';
import { WalletId } from '../base/wallet-id.interface';

export interface Transaction extends Id, CreatedAt, UpdatedAt, AmountMinor, Currency, Reference, TransactionId, WalletId {
  status: TransactionStatus;
  type: TransactionType;
}
