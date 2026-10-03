import { Injectable } from '@nestjs/common';
import { BaseExtendedRepository, PostgresService } from '@common/libs';

import { ClearReactionDto } from '../dtos/input/clear-reaction.dto';
import { MESSAGE_REACTION } from '../constants/chat/message-reaction.constant';
import { MessageRefDto } from '../dtos/input/message-ref.dto';
import { ReactionDto } from '../dtos/message/reaction.dto';
import { ReactionRowDto } from '../dtos/message/reaction-row.dto';
import { SetReactionDto } from '../dtos/input/set-reaction.dto';

@Injectable()
export class SupportReactionRepository extends BaseExtendedRepository<ReactionRowDto> {
  constructor (postgresService: PostgresService) {
    super({
      service: postgresService,
      tableName: MESSAGE_REACTION.TABLE,
      columnMappings: {
        messageId: 'message_id',
        userId: 'user_id',
        createdAt: 'created_at'
      }
    });
  }

  protected getSelectColumns (): string[] {
    return ['messageId', 'userId', 'emoji', 'createdAt'];
  }

  async set ({ messageId, userId, emoji }: SetReactionDto): Promise<void> {
    await this.service.getWriteConnection().query({ sql: MESSAGE_REACTION.SET_SQL, params: [messageId, userId, emoji] });
  }

  async clear ({ messageId, userId }: ClearReactionDto): Promise<void> {
    await this.service.getWriteConnection().query({ sql: MESSAGE_REACTION.CLEAR_SQL, params: [messageId, userId] });
  }

  async listFor ({ messageId }: MessageRefDto): Promise<ReactionDto[]> {
    const result = await this.service.getWriteConnection().query<ReactionDto>({ sql: MESSAGE_REACTION.LIST_SQL, params: [messageId] });
    return result.rows;
  }
}
