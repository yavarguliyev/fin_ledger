import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import * as jwt from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { CacheProvider } from '@common/redis';
import { REDIS_CACHE_PROVIDER } from '@common/shared-libs';

import { AUTH_CONSTANTS } from '../constants/auth.constant';
import { parseExpiryToSeconds } from '../helpers/session.helper';
import { JwtPayload, SessionData } from '../interfaces/session.interface';

@Injectable()
export class SessionService {
  constructor (
    @Inject(REDIS_CACHE_PROVIDER) private readonly redis: CacheProvider,
    private readonly configService: ConfigService
  ) {}

  async createSession (data: SessionData): Promise<string> {
    const jti = randomUUID();
    const expiresInConfig = this.configService.get<string>('JWT_EXPIRES_IN')!;
    const isNumeric = /^\d+$/.test(expiresInConfig);
    const expiresIn = isNumeric ? parseInt(expiresInConfig, 10) : (expiresInConfig as StringValue);
    const ttlSeconds = typeof expiresIn === 'number' ? expiresIn : parseExpiryToSeconds(expiresIn);

    await this.redis.set(`${AUTH_CONSTANTS.SESSION_PREFIX}${data.userId}:${jti}`, data, ttlSeconds);

    const privateKey = this.configService.get<string>('JWT_PRIVATE_KEY')!.replace(/\\n/g, '\n');
    const issuer = this.configService.get<string>('JWT_ISSUER');
    const audience = this.configService.get<string>('JWT_AUDIENCE');

    return jwt.sign({ ...data, jti }, privateKey, {
      algorithm: 'RS256',
      expiresIn,
      ...(issuer && { issuer }),
      ...(audience && { audience })
    });
  }

  async getSession (token: string): Promise<SessionData | null> {
    const publicKey = this.configService.get<string>('JWT_PUBLIC_KEY')!.replace(/\\n/g, '\n');
    const issuer = this.configService.get<string>('JWT_ISSUER');
    const audience = this.configService.get<string>('JWT_AUDIENCE');

    const decoded = jwt.verify(token, publicKey, {
      algorithms: ['RS256'],
      ...(issuer && { issuer }),
      ...(audience && { audience })
    });

    const payload = decoded as JwtPayload;
    if (!payload || !payload.jti) return null;

    return this.redis.get<SessionData>(`${AUTH_CONSTANTS.SESSION_PREFIX}${payload.userId}:${payload.jti}`);
  }

  async deleteSession (token: string): Promise<void> {
    const decoded = jwt.decode(token);
    const payload = decoded as JwtPayload | null;
    if (payload?.jti && payload?.userId) await this.redis.delete(`${AUTH_CONSTANTS.SESSION_PREFIX}${payload.userId}:${payload.jti}`);
  }

  async deleteUserSessions (userId: string): Promise<void> {
    const pattern = `${AUTH_CONSTANTS.SESSION_PREFIX}${userId}:*`;
    const userSessionKeys = await this.redis.scan(pattern);

    for (const key of userSessionKeys) {
      await this.redis.delete(key);
    }
  }
}
