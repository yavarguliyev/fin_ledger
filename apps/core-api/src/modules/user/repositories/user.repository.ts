import { Injectable } from '@nestjs/common';
import { BaseExtendedRepository, PostgresService, UnknownRecord, UserRoles, WalletStatus } from '@common/libs';

import { UserDto } from '../dtos/user/user.dto';
import { RetainedRowDto } from '../dtos/repository/retained-row.dto';
import { UserWithWalletDto } from '../dtos/user/user-with-wallet.dto';
import { FindPlayerPageDto } from '../dtos/repository/find-player-page.dto';
import { PlayerTotalsDto } from '../dtos/repository/player-totals.dto';
import { PlayerVolumeDto } from '../dtos/repository/player-volume.dto';
import { ADMIN_USER_LIST } from '../constants/admin-list/admin-user-list.constant';
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
        lastLoginIp: 'last_login_ip',
        isEmailVerified: 'is_email_verified',
        emailVerifiedAt: 'email_verified_at',
        countryCode: 'country_code',
        dateOfBirth: 'date_of_birth',
        kycStatus: 'kyc_status',
        selfExclusionUntil: 'self_exclusion_until',
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
      'lastLoginIp',
      'isEmailVerified',
      'countryCode',
      'dateOfBirth',
      'kycStatus',
      'selfExclusionUntil',
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

  async retainedRecords ({ userId }: UserIdRequestDto): Promise<RetainedRowDto | null> {
    const result = await this.service.getConnection().query<RetainedRowDto>({ sql: USER_CONSTANTS.RETAINED_RECORDS_QUERY, params: [userId] });
    return result.rows[0] ?? null;
  }

  async findAnonymizationBlockers ({ userId }: UserIdRequestDto): Promise<AnonymizationBlockersDto> {
    const { OPEN_PAYMENT_STATUSES, OPEN_BET_STATUSES, ANONYMIZATION_BLOCKERS_QUERY } = USER_CONSTANTS;
    const result = await this.service
      .getConnection()
      .query({ sql: ANONYMIZATION_BLOCKERS_QUERY, params: [userId, OPEN_PAYMENT_STATUSES, OPEN_BET_STATUSES] });

    return AnonymizationBlockersSchema.parse(result.rows[0]);
  }

  async anonymize ({ userId, email, displayName }: AnonymizeUserRecordDto): Promise<void> {
    const { ANONYMIZE_USER_SQL, CLOSE_USER_WALLETS_SQL, REMOVE_USER_PAYMENT_METHODS_SQL, DELETE_USER_NOTIFICATIONS_SQL, DELETE_USER_ADDRESS_SQL } = USER_CONSTANTS;

    await this.service.getWriteConnection().transaction({
      callback: async adapter => {
        await adapter.query({ sql: ANONYMIZE_USER_SQL, params: [userId, email, displayName] });
        await adapter.query({ sql: CLOSE_USER_WALLETS_SQL, params: [userId] });
        await adapter.query({ sql: REMOVE_USER_PAYMENT_METHODS_SQL, params: [userId, displayName] });
        await adapter.query({ sql: DELETE_USER_NOTIFICATIONS_SQL, params: [userId] });
        await adapter.query({ sql: DELETE_USER_ADDRESS_SQL, params: [userId] });
      }
    });
  }

  async findPlayerPage ({ limit, before, beforeId }: FindPlayerPageDto): Promise<UserWithWalletDto[]> {
    const result = await this.service.getConnection().query<UserWithWalletDto>({
      sql: ADMIN_USER_LIST.PAGE_SQL,
      params: [UserRoles.USER, before ?? null, beforeId ?? null, limit]
    });
    return result.rows;
  }

  async playerTotals (): Promise<PlayerTotalsDto> {
    const result = await this.service.getConnection().query<PlayerTotalsDto>({ sql: ADMIN_USER_LIST.TOTALS_SQL, params: [UserRoles.USER, WalletStatus.ACTIVE] });
    return result.rows[0] ?? { totalUsers: 0, activeWallets: 0 };
  }

  async playerVolumes (): Promise<PlayerVolumeDto[]> {
    const result = await this.service.getConnection().query<PlayerVolumeDto>({ sql: ADMIN_USER_LIST.VOLUMES_SQL, params: [UserRoles.USER] });
    return result.rows;
  }
}
