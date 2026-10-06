import { AdminUserPageQuery } from './admin-user-page-query.interface';
import { UserWithWallet } from './user-with-wallet.interface';

export interface AdminUserPage {
  users: UserWithWallet[];
  next: AdminUserPageQuery | null;
}
