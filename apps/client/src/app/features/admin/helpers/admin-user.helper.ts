import { AdminUser } from '../../../core/interfaces/admin/admin-user.interface';
import { UserRole } from '../../../core/types/auth/user-role.type';
import { ADMIN_TABLE } from '../../../core/constants/admin/admin-table.constant';
import { CURRENCY } from '../../../core/constants/wallet/currency.constant';
import { UserRecordRefDto } from '../../../core/dtos/admin/user-record-ref.dto';

export class AdminUserHelper {
  static fromRecord ({ user }: UserRecordRefDto): AdminUser {
    const { id, displayName: name, email, walletId, isEmailVerified, deletedAt } = user;

    return {
      id,
      name,
      email,
      role: user.role as UserRole,
      status: user.status ?? ADMIN_TABLE.ACTIVE_STATUS,
      userStatus: user.userStatus,
      balance: Number(user.availableBalanceMinor ?? 0) + Number(user.reservedBalanceMinor ?? 0),
      currency: user.currency ?? CURRENCY.DEFAULT,
      walletId,
      isEmailVerified,
      deletedAt
    };
  }
}
