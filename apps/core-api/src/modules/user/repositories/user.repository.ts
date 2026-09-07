import { Injectable } from '@nestjs/common';
import { BaseExtendedRepository, PostgresService, DatabaseAdapter, UnknownRecord, UserWalletStatus } from '@common/libs';

import { UserDto } from '../dtos/user/user.dto';
import { UserWithWalletDto } from '../dtos/user/user-with-wallet.dto';

@Injectable()
export class UserRepository extends BaseExtendedRepository<UserDto> {
  constructor (postgresService: PostgresService) {
    super(postgresService, 'users', {
      displayName: 'display_name',
      passwordHash: 'password_hash',
      profileImagesKey: 'profile_images_key',
      profileImages: 'profile_images',
      profileImageIndex: 'profile_image_index',
      walletId: 'wallet_id',
      ledgerAccountId: 'ledger_account_id',
      lastLogin: 'last_login',
      isEmailVerified: 'is_email_verified',
      deletedAt: 'deleted_at',
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    });
  }

  protected getSelectColumns (): string[] {
    return [
      'id',
      'email',
      'displayName',
      'role',
      'profileImagesKey',
      'profileImages',
      'profileImageIndex',
      'walletId',
      'ledgerAccountId',
      'lastLogin',
      'isEmailVerified',
      'deletedAt',
      'createdAt',
      'updatedAt'
    ];
  }

  async updateUser (userId: string, updates: Partial<UserDto>, adapter?: DatabaseAdapter): Promise<UserDto | null> {
    const transformedUpdates: Partial<UnknownRecord> = { ...updates };

    if (updates.profileImages !== undefined && Array.isArray(updates.profileImages)) {
      transformedUpdates['profile_images'] = JSON.stringify(updates.profileImages);
      delete transformedUpdates['profileImages'];
    }

    return this.update(userId, transformedUpdates, undefined, adapter);
  }

  async findAllWithWallets (adapter?: DatabaseAdapter): Promise<UserWithWalletDto[]> {
    const columns = [
      'users.id',
      'users.email',
      'users.displayName',
      'users.role',
      'users.walletId',
      'users.isEmailVerified',
      'users.deletedAt',
      'users.createdAt',
      'wallets.available_balance_minor',
      'wallets.reserved_balance_minor',
      'wallets.currency',
      'wallets.status'
    ];

    const joins = [
      {
        table: 'wallets',
        left: 'users.walletId',
        right: 'wallets.id',
        type: 'LEFT' as const
      }
    ];

    const { query, params } = this.builder.buildSelectQuery(
      columns,
      {
        where: { role: 'user' },
        orderBy: 'users.createdAt',
        orderDirection: 'DESC'
      },
      joins
    );

    const db = adapter ?? this.service.getConnection();
    const result = await db.query<Record<string, unknown>>(query, params);

    return result.rows.map(row => this.mapRowToUserWithWallet(row));
  }

  private mapRowToUserWithWallet (row: Record<string, unknown>): UserWithWalletDto {
    return {
      id: row['users.id'] as string,
      email: row['users.email'] as string,
      display_name: row['users.displayName'] as string,
      role: row['users.role'] as string,
      wallet_id: (row['users.walletId'] as string | null) ?? null,
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
