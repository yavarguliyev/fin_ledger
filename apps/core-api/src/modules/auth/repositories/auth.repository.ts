import { Injectable } from '@nestjs/common';
import { BaseRepository, PostgresService, DatabaseAdapter, UserRoles } from '@common/libs';

import { AuthDto } from '../dtos/auth/auth.dto';

@Injectable()
export class AuthRepository extends BaseRepository<AuthDto> {
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
      'passwordHash',
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

  async findByEmail (email: string, adapter?: DatabaseAdapter): Promise<AuthDto | null> {
    return this.findOne({ email, isEmailVerified: true, deletedAt: null }, adapter);
  }

  async findByEmailForSignUp (email: string, adapter?: DatabaseAdapter): Promise<AuthDto | null> {
    return this.findOne({ email }, adapter);
  }

  async createUser (email: string, passwordHash: string, role: UserRoles, displayName: string, adapter?: DatabaseAdapter): Promise<AuthDto | null> {
    return this.create({ email, passwordHash, role, displayName, isEmailVerified: false }, undefined, adapter);
  }

  async linkWalletAndLedger (userId: string, walletId: string, ledgerAccountId: string, adapter?: DatabaseAdapter): Promise<AuthDto | null> {
    return this.update(userId, { walletId, ledgerAccountId }, undefined, adapter);
  }
}
