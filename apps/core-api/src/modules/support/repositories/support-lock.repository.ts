import { Injectable } from '@nestjs/common';
import { BaseExtendedRepository, PostgresService } from '@common/libs';

import { LockRowDto } from '../dtos/message/lock-row.dto';
import { LockStateDto } from '../dtos/message/lock-state.dto';
import { LockWindowDto } from '../dtos/input/lock-window.dto';
import { StarredFilterDto } from '../dtos/input/starred-filter.dto';
import { SUPPORT_LOCK } from '../constants/chat/support-lock.constant';

@Injectable()
export class SupportLockRepository extends BaseExtendedRepository<LockRowDto> {
  constructor (postgresService: PostgresService) {
    super({
      service: postgresService,
      tableName: SUPPORT_LOCK.TABLE,
      columnMappings: { conversationId: 'conversation_id', userId: 'user_id', unlockedUntil: 'unlocked_until', createdAt: 'created_at' }
    });
  }

  protected getSelectColumns (): string[] {
    return ['conversationId', 'userId', 'unlockedUntil', 'createdAt'];
  }

  async lock ({ conversationId, userId }: StarredFilterDto): Promise<void> {
    await this.service.getWriteConnection().query({ sql: SUPPORT_LOCK.LOCK_SQL, params: [conversationId, userId] });
  }

  async remove ({ conversationId, userId }: StarredFilterDto): Promise<void> {
    await this.service.getWriteConnection().query({ sql: SUPPORT_LOCK.REMOVE_SQL, params: [conversationId, userId] });
  }

  async openWindow ({ conversationId, userId, seconds }: LockWindowDto): Promise<void> {
    await this.service.getWriteConnection().query({ sql: SUPPORT_LOCK.OPEN_WINDOW_SQL, params: [conversationId, userId, seconds] });
  }

  async state ({ conversationId, userId }: StarredFilterDto): Promise<LockStateDto | null> {
    const result = await this.service.getWriteConnection().query<LockStateDto>({ sql: SUPPORT_LOCK.STATE_SQL, params: [conversationId, userId] });
    return result.rows[0] ?? null;
  }
}
