import { Injectable } from '@nestjs/common';
import { BaseExtendedRepository, PostgresService } from '@common/libs';

import { MessagePinDto } from '../dtos/input/message-pin.dto';
import { PinnedRowDto } from '../dtos/response/pinned-row.dto';
import { PinWindowDto } from '../dtos/input/pin-window.dto';
import { ReadConversationDto, SupportMessageDto } from '../../support';
import { SUPPORT_PINS } from '../constants/support-pins.constant';
import { SUPPORT_PINS_SQL } from '../constants/support-pins-sql.constant';

@Injectable()
export class SupportPinsRepository extends BaseExtendedRepository<PinnedRowDto> {
  constructor (postgresService: PostgresService) {
    super({ service: postgresService, tableName: SUPPORT_PINS.TABLE, columnMappings: { messageId: 'message_id' } });
  }

  protected getSelectColumns (): string[] {
    return ['messageId'];
  }

  async list ({ conversationId, userId }: ReadConversationDto): Promise<SupportMessageDto[]> {
    const result = await this.service.getWriteConnection().query<SupportMessageDto>({ sql: SUPPORT_PINS_SQL.LIST, params: [conversationId, userId] });
    return result.rows;
  }

  async pin ({ messageId, conversationId, userId, seconds }: PinWindowDto): Promise<boolean> {
    const result = await this.service.getWriteConnection().query<PinnedRowDto>({ sql: SUPPORT_PINS_SQL.PIN, params: [messageId, conversationId, userId, seconds] });
    if (!result.rows.length) return false;
    await this.service.getWriteConnection().query({ sql: SUPPORT_PINS_SQL.TRIM, params: [conversationId, SUPPORT_PINS.LIMIT] });
    return true;
  }

  async unpin ({ messageId, conversationId }: MessagePinDto): Promise<void> {
    await this.service.getWriteConnection().query({ sql: SUPPORT_PINS_SQL.UNPIN, params: [messageId, conversationId] });
  }
}
