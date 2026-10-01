import { UserAccountStatus } from '../../types/user/user-account-status.type';
import { CreatedAt } from '../base/created-at.interface';
import { DisplayName } from '../base/display-name.interface';
import { Email } from '../base/email.interface';
import { Id } from '../base/id.interface';

export interface UserWithWallet extends Id, Email, DisplayName, CreatedAt {
  role: string;
  userStatus: UserAccountStatus;
  walletId: string | null;
  isEmailVerified: boolean;
  deletedAt: string | null;
  currency: string | null;
  status: string | null;
  availableBalanceMinor: number | null;
  reservedBalanceMinor: number | null;
}
