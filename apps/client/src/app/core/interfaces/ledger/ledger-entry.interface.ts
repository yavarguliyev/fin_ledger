import { LedgerWalletTransactionType } from '../../types/ledger/ledger-wallet-transaction-type.type';
import { AccountId } from '../base/account-id.interface';
import { AmountMinor } from '../base/amount-minor.interface';
import { CreatedAt } from '../base/created-at.interface';
import { Currency } from '../base/currency.interface';
import { Id } from '../base/id.interface';
import { Reference } from '../base/reference.interface';
import { TransactionId } from '../base/transaction-id.interface';

export interface LedgerEntry extends Id, Currency, CreatedAt, AmountMinor, Reference, AccountId, TransactionId {
  description: string;
  sequence: number;
  entryType: LedgerWalletTransactionType;
}
