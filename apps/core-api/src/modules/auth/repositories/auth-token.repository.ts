import { Injectable } from '@nestjs/common';
import { BaseExtendedRepository, PostgresService } from '@common/libs';

import { AuthTokenDto } from '../dtos/token/auth-token.dto';
import { ClaimedAuthTokenDto } from '../dtos/token/claimed-auth-token.dto';
import { IssueAuthTokenDto } from '../dtos/repository/issue-auth-token.dto';
import { ClaimAuthTokenDto } from '../dtos/repository/claim-auth-token.dto';
import { FindActiveAuthTokenDto } from '../dtos/repository/find-active-auth-token.dto';
import { RecordAuthTokenFailureDto } from '../dtos/repository/record-auth-token-failure.dto';

@Injectable()
export class AuthTokenRepository extends BaseExtendedRepository<AuthTokenDto> {
  constructor (postgresService: PostgresService) {
    super({
      service: postgresService,
      tableName: 'auth_tokens',
      columnMappings: {
        userId: 'user_id',
        tokenHash: 'token_hash',
        expiresAt: 'expires_at',
        usedAt: 'used_at',
        revokedAt: 'revoked_at',
        failedAttempts: 'failed_attempts',
        createdAt: 'created_at'
      }
    });
  }

  protected getSelectColumns (): string[] {
    return ['id', 'userId', 'purpose', 'tokenHash', 'expiresAt', 'usedAt', 'revokedAt', 'failedAttempts', 'createdAt'];
  }

  async issue ({ userId, purpose, tokenHash, expiresAt }: IssueAuthTokenDto): Promise<void> {
    await this.service.getWriteConnection().transaction({
      callback: async adapter => {
        await this.updateWhere({ where: { userId, purpose, usedAt: null, revokedAt: null }, data: { revokedAt: new Date().toISOString() }, adapter });
        await this.create({ data: { userId, purpose, tokenHash, expiresAt }, adapter });
      }
    });
  }

  async findActive ({ tokenHash, purposes }: FindActiveAuthTokenDto): Promise<ClaimedAuthTokenDto | null> {
    const token = await this.findActiveRow({ tokenHash, purposes });
    return token ? { userId: token.userId, purpose: token.purpose } : null;
  }

  async claim ({ tokenHash, purposes, adapter }: ClaimAuthTokenDto): Promise<ClaimedAuthTokenDto | null> {
    const token = await this.findActiveRow({ tokenHash, purposes, ...(adapter && { adapter }) });
    if (!token) return null;

    const claimed = await this.updateWhere({ where: { id: token.id, usedAt: null, revokedAt: null }, data: { usedAt: new Date().toISOString() }, adapter });
    return claimed ? { userId: token.userId, purpose: token.purpose } : null;
  }

  async recordFailure ({ tokenHash, maxAttempts }: RecordAuthTokenFailureDto): Promise<void> {
    const token = await this.findOne({ where: { tokenHash, usedAt: null, revokedAt: null } });
    if (!token) return;

    const updated = await this.increment({ id: token.id, field: 'failedAttempts', amount: 1 });
    if (updated && updated.failedAttempts >= maxAttempts) {
      await this.updateWhere({ where: { id: token.id, revokedAt: null }, data: { revokedAt: new Date().toISOString() } });
    }
  }

  private async findActiveRow ({ tokenHash, purposes, adapter }: ClaimAuthTokenDto): Promise<AuthTokenDto | null> {
    const token = await this.findOne({ where: { tokenHash, usedAt: null, revokedAt: null }, ...(adapter && { adapter }) });
    if (!token || !purposes.includes(token.purpose) || new Date(token.expiresAt) <= new Date()) return null;

    return token;
  }
}
