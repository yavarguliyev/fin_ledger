import { Injectable } from '@nestjs/common';
import { BaseExtendedRepository, PostgresService } from '@common/libs';

import { MESSAGE_STAR } from '../constants/chat/message-star.constant';
import { StarRefDto } from '../dtos/input/star-ref.dto';
import { StarRowDto } from '../dtos/message/star-row.dto';
import { StarredFilterDto } from '../dtos/input/starred-filter.dto';
import { StarredMessageDto } from '../dtos/message/starred-message.dto';
import { UserRefDto } from '../dtos/input/user-ref.dto';

@Injectable()
export class SupportStarRepository extends BaseExtendedRepository<StarRowDto> {
  constructor (postgresService: PostgresService) {
    super({ service: postgresService, tableName: MESSAGE_STAR.TABLE, columnMappings: { messageId: 'message_id', userId: 'user_id', createdAt: 'created_at' } });
  }

  protected getSelectColumns (): string[] {
    return ['messageId', 'userId', 'createdAt'];
  }

  async star ({ messageId, userId }: StarRefDto): Promise<void> {
    await this.service.getWriteConnection().query({ sql: MESSAGE_STAR.STAR_SQL, params: [messageId, userId] });
  }

  async unstar ({ messageId, userId }: StarRefDto): Promise<void> {
    await this.service.getWriteConnection().query({ sql: MESSAGE_STAR.UNSTAR_SQL, params: [messageId, userId] });
  }

  async listFor ({ userId, conversationId }: StarredFilterDto): Promise<StarredMessageDto[]> {
    const result = await this.service.getWriteConnection().query<StarredMessageDto>({ sql: MESSAGE_STAR.LIST_SQL, params: [userId, conversationId] });
    return result.rows;
  }

  async listAll ({ userId }: UserRefDto): Promise<StarredMessageDto[]> {
    const result = await this.service.getWriteConnection().query<StarredMessageDto>({ sql: MESSAGE_STAR.LIST_ALL_SQL, params: [userId, MESSAGE_STAR.LIST_ALL_LIMIT] });
    return result.rows;
  }
}
