import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { CacheProvider } from '@common/redis';
import { CryptoHelper, REDIS_CACHE_PROVIDER } from '@common/shared-libs';

import { AUTH_CONSTANTS } from '../constants/auth/auth.constant';
import { RefreshRecord } from '../interfaces/refresh-record.interface';
import { RotatedRefresh } from '../interfaces/rotated-refresh.interface';
import { IssueRefreshDto } from '../dtos/service/issue-refresh.dto';
import { RefreshTokenDto } from '../dtos/service/refresh-token.dto';
import { UserSessionsDto } from '../dtos/service/user-sessions.dto';
import { RefreshRecordRefDto } from '../dtos/service/refresh-record-ref.dto';
import { StoreRefreshDto } from '../dtos/service/store-refresh.dto';
import { ConfigService } from '@nestjs/config';

import { SessionService } from './session.service';

@Injectable()
export class RefreshService {
  private readonly logger = new Logger(RefreshService.name);

  constructor (
    @Inject(REDIS_CACHE_PROVIDER) private readonly redis: CacheProvider,
    private readonly sessionService: SessionService,
    private readonly configService: ConfigService
  ) {}

  async issue ({ userId }: IssueRefreshDto): Promise<string> {
    const refreshToken = `${userId}${AUTH_CONSTANTS.REFRESH_SEPARATOR}${CryptoHelper.randomToken({ bytes: AUTH_CONSTANTS.REFRESH_BYTES })}`;
    const record: RefreshRecord = { userId, used: false };

    await this.store({ refreshToken, record });
    return refreshToken;
  }

  async rotate ({ refreshToken }: RefreshTokenDto): Promise<RotatedRefresh> {
    const record = await this.redis.get<RefreshRecord>({ key: this.keyFor({ refreshToken }) });

    if (!record) throw new UnauthorizedException(AUTH_CONSTANTS.REFRESH_INVALID_MESSAGE);
    if (record.used) return this.replay({ record });

    const replacement = await this.issue({ userId: record.userId });
    await this.store({ refreshToken, record: { ...record, used: true, replacedBy: replacement, usedAt: Date.now() } });
    return { record, refreshToken: replacement };
  }

  async revoke ({ refreshToken }: RefreshTokenDto): Promise<void> {
    await this.redis.delete({ key: this.keyFor({ refreshToken }) });
  }

  async revokeEverySession ({ userId }: UserSessionsDto): Promise<void> {
    const keys = await this.redis.scan({ pattern: `${AUTH_CONSTANTS.REFRESH_PREFIX}${userId}:*` });
    await Promise.all([...keys.map(key => this.redis.delete({ key })), this.sessionService.deleteUserSessions({ userId })]);
  }

  private async store ({ refreshToken, record }: StoreRefreshDto): Promise<void> {
    await this.redis.set({ key: this.keyFor({ refreshToken }), value: record, ttlSeconds: AUTH_CONSTANTS.REFRESH_TTL_SECONDS });
  }

  private graceMs (): number {
    return Number(this.configService.get<string>(AUTH_CONSTANTS.REFRESH_GRACE_KEY) ?? AUTH_CONSTANTS.REFRESH_GRACE_MS);
  }

  private keyFor ({ refreshToken }: RefreshTokenDto): string {
    const separator = refreshToken.indexOf(AUTH_CONSTANTS.REFRESH_SEPARATOR);
    if (separator <= 0) throw new UnauthorizedException(AUTH_CONSTANTS.REFRESH_INVALID_MESSAGE);

    const userId = refreshToken.slice(0, separator);
    const secret = refreshToken.slice(separator + 1);

    return `${AUTH_CONSTANTS.REFRESH_PREFIX}${userId}:${CryptoHelper.sha256({ value: secret })}`;
  }

  private async replay ({ record }: RefreshRecordRefDto): Promise<RotatedRefresh> {
    const withinGrace = !!record.usedAt && Date.now() - record.usedAt <= this.graceMs();

    if (withinGrace && record.replacedBy) {
      this.logger.warn(`Refresh token presented twice inside the grace window for user ${record.userId}; returning the same replacement`);
      return { record, refreshToken: record.replacedBy };
    }

    this.logger.error(`Refresh token replayed for user ${record.userId}; ending every session of the account`);
    await this.revokeEverySession({ userId: record.userId });

    throw new UnauthorizedException(AUTH_CONSTANTS.REFRESH_REUSE_MESSAGE);
  }
}
