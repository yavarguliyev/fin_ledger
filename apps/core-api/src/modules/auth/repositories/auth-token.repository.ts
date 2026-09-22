import { Injectable } from '@nestjs/common';
import { BaseRepository, PostgresService } from '@common/libs';

import { AuthTokenDto } from '../dtos/token/auth-token.dto';
import { ClaimedAuthTokenDto } from '../dtos/token/claimed-auth-token.dto';
import { IssueAuthTokenDto } from '../dtos/repository/issue-auth-token.dto';
import { ClaimAuthTokenDto } from '../dtos/repository/claim-auth-token.dto';
import { AUTH_TOKEN_CONSTANTS } from '../constants/tokens/auth-token.constant';

@Injectable()
export class AuthTokenRepository extends BaseRepository<AuthTokenDto> {
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
        createdAt: 'created_at'
      }
    });
  }

  protected getSelectColumns (): string[] {
    return ['id', 'userId', 'purpose', 'tokenHash', 'expiresAt', 'usedAt', 'revokedAt', 'createdAt'];
  }

  async issue ({ userId, purpose, tokenHash, expiresAt }: IssueAuthTokenDto): Promise<void> {
    const { REVOKE_ACTIVE_SQL, INSERT_SQL } = AUTH_TOKEN_CONSTANTS;

    await this.service.getWriteConnection().transaction({
      callback: async adapter => {
        await adapter.query({ sql: REVOKE_ACTIVE_SQL, params: [userId, purpose] });
        await adapter.query({ sql: INSERT_SQL, params: [userId, purpose, tokenHash, expiresAt] });
      }
    });
  }

  async claim ({ tokenHash, purposes, adapter }: ClaimAuthTokenDto): Promise<ClaimedAuthTokenDto | null> {
    const connection = adapter ?? this.service.getWriteConnection();
    const result = await connection.query<ClaimedAuthTokenDto>({ sql: AUTH_TOKEN_CONSTANTS.CLAIM_SQL, params: [tokenHash, purposes] });

    return result.rows[0] ?? null;
  }
}
