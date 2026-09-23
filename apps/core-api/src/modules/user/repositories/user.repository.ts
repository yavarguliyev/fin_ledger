import { Injectable } from '@nestjs/common';
import { BaseExtendedRepository, PostgresService, UnknownRecord, UserRoles, UserStatus, UserWalletStatus } from '@common/libs';

import { UserDto } from '../dtos/user/user.dto';
import { UserWithWalletDto } from '../dtos/user/user-with-wallet.dto';
import { UpdateUserRecordDto } from '../dtos/repository/update-user-record.dto';
import { UserIdRequestDto } from '../dtos/request/user-id-request.dto';
import { AnonymizeUserRecordDto } from '../dtos/repository/anonymize-user-record.dto';
import { AnonymizationBlockersDto, AnonymizationBlockersSchema } from '../dtos/repository/anonymization-blockers.dto';
import { USER_CONSTANTS } from '../constants/anonymization/user.constant';

@Injectable()
export class UserRepository extends BaseExtendedRepository<UserDto> {
  constructor (postgresService: PostgresService) {
    super({
      service: postgresService,
      tableName: 'users',
      columnMappings: {
        displayName: 'display_name',
        passwordHash: 'password_hash',
        passwordChangedAt: 'password_changed_at',
        profileImagesKey: 'profile_images_key',
        profileImages: 'profile_images',
        profileImageIndex: 'profile_image_index',
        lastLoginAt: 'last_login_at',
        isEmailVerified: 'is_email_verified',
        emailVerifiedAt: 'email_verified_at',
        deletedAt: 'deleted_at',
        createdAt: 'created_at',
        updatedAt: 'updated_at'
      }
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
      'status',
      'lastLoginAt',
      'isEmailVerified',
      'deletedAt',
      'createdAt',
      'updatedAt'
    ];
  }

  async updateUser (dto: UpdateUserRecordDto): Promise<UserDto | null> {
    const { userId, updates, adapter } = dto;
    const transformedUpdates: Partial<UnknownRecord> = { ...updates };

    if (updates.profileImages !== undefined && Array.isArray(updates.profileImages)) {
      transformedUpdates['profile_images'] = JSON.stringify(updates.profileImages);
      delete transformedUpdates['profileImages'];
    }

    return this.update({ id: userId, data: transformedUpdates, adapter });
  }

  async hasRetainedRecords ({ userId }: UserIdRequestDto): Promise<boolean> {
    const result = await this.service.getConnection().query<{ retained: boolean }>({ sql: USER_CONSTANTS.RETAINED_RECORDS_QUERY, params: [userId] });
    return result.rows[0]?.retained ?? false;
  }

  async findAnonymizationBlockers ({ userId }: UserIdRequestDto): Promise<AnonymizationBlockersDto> {
    const { OPEN_PAYMENT_STATUSES, OPEN_BET_STATUSES, ANONYMIZATION_BLOCKERS_QUERY } = USER_CONSTANTS;
    const result = await this.service
      .getConnection()
      .query({ sql: ANONYMIZATION_BLOCKERS_QUERY, params: [userId, OPEN_PAYMENT_STATUSES, OPEN_BET_STATUSES] });
    return AnonymizationBlockersSchema.parse(result.rows[0]);
  }

  async anonymize ({ userId, email, displayName }: AnonymizeUserRecordDto): Promise<void> {
    const { ANONYMIZE_USER_SQL, CLOSE_USER_WALLETS_SQL, REMOVE_USER_PAYMENT_METHODS_SQL, DELETE_USER_NOTIFICATIONS_SQL } = USER_CONSTANTS;

    await this.service.getWriteConnection().transaction({
      callback: async adapter => {
        await adapter.query({ sql: ANONYMIZE_USER_SQL, params: [userId, email, displayName] });
        await adapter.query({ sql: CLOSE_USER_WALLETS_SQL, params: [userId] });
        await adapter.query({ sql: REMOVE_USER_PAYMENT_METHODS_SQL, params: [userId, displayName] });
        await adapter.query({ sql: DELETE_USER_NOTIFICATIONS_SQL, params: [userId] });
      }
    });
  }

  async findAllWithWallets (): Promise<UserWithWalletDto[]> {
    const columns = [
      'users.id',
      'users.email',
      'users.displayName',
      'users.role',
      'users.status',
      'users.isEmailVerified',
      'users.deletedAt',
      'users.createdAt',
      'wallets.id',
      'wallets.available_balance_minor',
      'wallets.reserved_balance_minor',
      'wallets.currency',
      'wallets.status'
    ];

    const joins = [
      {
        table: 'wallets',
        left: 'users.id',
        right: 'wallets.user_id',
        type: 'LEFT' as const
      }
    ];

    const { query, params } = this.builder.buildSelectQuery({
      columns,
      options: {
        where: { role: UserRoles.USER },
        orderBy: 'users.createdAt',
        orderDirection: 'DESC'
      },
      joins
    });

    const result = await this.service.getConnection().query<Record<string, unknown>>({ sql: query, params });

    return result.rows.map(row => this.mapRowToUserWithWallet(row));
  }

  private mapRowToUserWithWallet (row: Record<string, unknown>): UserWithWalletDto {
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
