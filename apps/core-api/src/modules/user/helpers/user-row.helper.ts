import { UserStatus, UserWalletStatus } from '@common/libs';

import { UserRowDto } from '../dtos/repository/user-row.dto';
import { UserWithWalletDto } from '../dtos/user/user-with-wallet.dto';

export class UserRowHelper {
  static toUserWithWallet ({ row }: UserRowDto): UserWithWalletDto {
    return {
      id: row['users.id'] as string,
      email: row['users.email'] as string,
      display_name: row['users.displayName'] as string,
      role: row['users.role'] as string,
      user_status: row['users.status'] as UserStatus,
      wallet_id: (row['wallets.id'] as string | null) ?? null,
      is_email_verified: row['users.isEmailVerified'] as boolean,
      deleted_at: (row['users.deletedAt'] as string | null) ?? null,
      created_at: row['users.createdAt'] as string,
      available_balance_minor: row['wallets.available_balance_minor'] !== null ? Number(row['wallets.available_balance_minor']) : null,
      reserved_balance_minor: row['wallets.reserved_balance_minor'] !== null ? Number(row['wallets.reserved_balance_minor']) : null,
      currency: (row['wallets.currency'] as string | null) ?? null,
      status: (row['wallets.status'] as UserWalletStatus | null) ?? null
    };
  }
}
