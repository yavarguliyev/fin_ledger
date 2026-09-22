import { LedgerAccountType } from '../../types/ledger/ledger-account-type.type';
import { BalanceMinor } from '../base/balance-minor.interface';
import { CreatedAt } from '../base/created-at.interface';
import { Currency } from '../base/currency.interface';
import { Id } from '../base/id.interface';
import { UpdatedAt } from '../base/updated-at.interface';
import { UserId } from '../base/user-id.interface';

export interface LedgerAccount extends Id, UserId, Currency, CreatedAt, UpdatedAt, BalanceMinor {
  accountType: LedgerAccountType;
}
