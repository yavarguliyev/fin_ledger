import { Injectable } from '@nestjs/common';
import { BaseRepository, PostgresService, PasswordAlgorithm } from '@common/libs';

import { FindByEmailDto } from '../dtos/repository/find-by-email.dto';
import { AuthDto } from '../dtos/auth/auth.dto';
import { CreateAuthUserDto } from '../dtos/repository/create-auth-user.dto';

@Injectable()
export class AuthRepository extends BaseRepository<AuthDto> {
  constructor (postgresService: PostgresService) {
    super({
      service: postgresService,
      tableName: 'users',
      columnMappings: {
        displayName: 'display_name',
        passwordHash: 'password_hash',
        passwordAlgo: 'password_algo',
        profileImagesKey: 'profile_images_key',
        profileImages: 'profile_images',
        profileImageIndex: 'profile_image_index',
        lastLoginAt: 'last_login_at',
        isEmailVerified: 'is_email_verified',
        emailVerifiedAt: 'email_verified_at',
        termsAcceptedAt: 'terms_accepted_at',
        mfaSecretEncrypted: 'mfa_secret_encrypted',
        mfaEnabledAt: 'mfa_enabled_at',
        mfaLastUsedStep: 'mfa_last_used_step',
        passwordChangedAt: 'password_changed_at',
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
      'passwordHash',
      'passwordAlgo',
      'role',
      'profileImagesKey',
      'profileImages',
      'profileImageIndex',
      'status',
      'lastLoginAt',
      'isEmailVerified',
      'termsAcceptedAt',
      'mfaSecretEncrypted',
      'mfaEnabledAt',
      'mfaLastUsedStep',
      'deletedAt',
      'createdAt',
      'updatedAt'
    ];
  }

  async findByEmail ({ email, adapter }: FindByEmailDto): Promise<AuthDto | null> {
    return this.findOne({ where: { email, isEmailVerified: true, deletedAt: null }, ...(adapter && { adapter }) });
  }

  async findByEmailAny ({ email, adapter }: FindByEmailDto): Promise<AuthDto | null> {
    return this.findOne({ where: { email }, ...(adapter && { adapter }) });
  }

  async createUser ({ email, passwordHash, role, displayName, termsAcceptedAt, adapter }: CreateAuthUserDto): Promise<AuthDto | null> {
    return this.create({
      data: {
        email,
        passwordHash,
        passwordAlgo: PasswordAlgorithm.ARGON2ID,
        passwordChangedAt: new Date().toISOString(),
        role,
        displayName,
        isEmailVerified: false,
        termsAcceptedAt
      },
      ...(adapter && { adapter })
    });
  }
}
