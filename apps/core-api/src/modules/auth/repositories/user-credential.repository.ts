import { Injectable } from '@nestjs/common';
import { BaseRepository, PostgresService } from '@common/libs';

import { UserCredentialDto } from '../dtos/passkeys/user-credential.dto';
import { SaveCredentialDto } from '../dtos/passkeys/save-credential.dto';
import { CredentialIdDto } from '../dtos/passkeys/credential-id.dto';
import { RecordUsageDto } from '../dtos/passkeys/record-usage.dto';
import { UserSessionsDto } from '../dtos/passkeys/credential-owner.dto';

@Injectable()
export class UserCredentialRepository extends BaseRepository<UserCredentialDto> {
  constructor (postgresService: PostgresService) {
    super({
      service: postgresService,
      tableName: 'user_credentials',
      columnMappings: {
        userId: 'user_id',
        credentialId: 'credential_id',
        publicKey: 'public_key',
        signCount: 'sign_count',
        deviceLabel: 'device_label',
        backedUp: 'backed_up',
        lastUsedAt: 'last_used_at',
        createdAt: 'created_at',
        updatedAt: 'updated_at'
      }
    });
  }

  protected getSelectColumns (): string[] {
    return [
      'id',
      'userId',
      'credentialId',
      'publicKey',
      'signCount',
      'transports',
      'deviceLabel',
      'backedUp',
      'lastUsedAt',
      'createdAt',
      'updatedAt'
    ];
  }

  async findForUser ({ userId }: UserSessionsDto): Promise<UserCredentialDto[]> {
    return this.findAll({ where: { userId }, orderBy: 'created_at', orderDirection: 'DESC' });
  }

  async findByCredentialId ({ credentialId }: CredentialIdDto): Promise<UserCredentialDto | null> {
    return this.findOne({ where: { credentialId } });
  }

  async save ({ userId, credentialId, publicKey, signCount, transports, backedUp, deviceLabel }: SaveCredentialDto): Promise<void> {
    await this.create({
      data: { userId, credentialId, publicKey, signCount, transports, backedUp, deviceLabel: deviceLabel ?? null }
    });
  }

  async recordUsage ({ id, signCount }: RecordUsageDto): Promise<void> {
    await this.update({ id, data: { signCount, lastUsedAt: new Date().toISOString() } });
  }
}
