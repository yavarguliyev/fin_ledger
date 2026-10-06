import { Injectable } from '@nestjs/common';
import { PostgresService } from '@common/libs';

import { MESSAGE_STAR } from '../constants/chat/message-star.constant';
import { StarRefDto } from '../dtos/input/star-ref.dto';
import { StarredFilterDto } from '../dtos/input/starred-filter.dto';
import { StarredMessageDto } from '../dtos/message/starred-message.dto';

@Injectable()
export class SupportStarRepository {
  constructor (private readonly service: PostgresService) {}

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
}
