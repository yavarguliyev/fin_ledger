import { WalletStatus } from '../../types/wallet/wallet-status.type';
import { AvailableBalanceMinor } from '../base/available-balance-minor.interface';
import { CreatedAt } from '../base/created-at.interface';
import { Currency } from '../base/currency.interface';
import { Id } from '../base/id.interface';
import { ReservedBalanceMinor } from '../base/reserved-balance-minor.interface';
import { UpdatedAt } from '../base/updated-at.interface';
import { UserId } from '../base/user-id.interface';

export interface Wallet extends Id, UserId, CreatedAt, UpdatedAt, Currency, AvailableBalanceMinor, ReservedBalanceMinor {
  ledgerAccountId: string;
  version: number;
  status: WalletStatus;
}
