import { UserAccountStatus } from '../../types/user/user-account-status.type';
import { Email } from '../base/email.interface';
import { Id } from '../base/id.interface';

export interface BackendUserWithWallet extends Id, Email {
  role: string;
  user_status: UserAccountStatus;
  display_name: string;
  wallet_id: string | null;
  is_email_verified: boolean;
  deleted_at: string | null;
  created_at: string;
  available_balance_minor: number | null;
  reserved_balance_minor: number | null;
  currency: string | null;
  status: 'ACTIVE' | 'SUSPENDED' | 'CLOSED' | null;
}
