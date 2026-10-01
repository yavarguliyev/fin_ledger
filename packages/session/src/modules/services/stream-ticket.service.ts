import { Inject, Injectable } from '@nestjs/common';
import { CacheProvider } from '@common/redis';
import { CryptoHelper, REDIS_CACHE_PROVIDER } from '@common/shared-libs';

import { AUTH_CONSTANTS } from '../constants/auth/auth.constant';
import { SessionData } from '../interfaces/session-data.interface';
import { StreamTicketDto } from '../dtos/service/stream-ticket.dto';
import { IssueStreamTicketDto } from '../dtos/service/issue-stream-ticket.dto';

@Injectable()
export class StreamTicketService {
  constructor (@Inject(REDIS_CACHE_PROVIDER) private readonly redis: CacheProvider) {}

  async issue ({ session }: IssueStreamTicketDto): Promise<string> {
    const ticket = CryptoHelper.randomToken({ bytes: AUTH_CONSTANTS.STREAM_TICKET_BYTES });
    await this.redis.set({ key: this.keyFor({ ticket }), value: session, ttlSeconds: AUTH_CONSTANTS.STREAM_TICKET_TTL_SECONDS });
    return ticket;
  }

  async claim ({ ticket }: StreamTicketDto): Promise<SessionData | null> {
    const key = this.keyFor({ ticket });
    const session = await this.redis.get<SessionData>({ key });
    if (session) await this.redis.delete({ key });
    return session;
  }

  private keyFor ({ ticket }: StreamTicketDto): string {
    return `${AUTH_CONSTANTS.STREAM_TICKET_PREFIX}${CryptoHelper.sha256({ value: ticket })}`;
  }
}
