import { Email } from '../base/email.interface';
import { Id } from '../base/id.interface';
import { Roles } from '../base/roles.interface';

export interface AdminUser extends Id, Email, Roles {
  name: string;
  status: string;
  balance: number;
  currency: string;
  walletId: string | null;
  isEmailVerified: boolean;
  deletedAt: string | null;
}
