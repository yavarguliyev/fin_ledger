import { Injectable } from '@nestjs/common';
import { BaseExtendedRepository, PostgresService } from '@common/libs';

import { ClearChatDto } from '../dtos/input/clear-chat.dto';
import { HistoryCountDto } from '../dtos/response/history-count.dto';
import { SUPPORT_HISTORY } from '../constants/support-history.constant';

@Injectable()
export class SupportHistoryRepository extends BaseExtendedRepository<HistoryCountDto> {
  constructor (postgresService: PostgresService) {
    super({ service: postgresService, tableName: SUPPORT_HISTORY.TABLE, columnMappings: {} });
  }

  protected getSelectColumns (): string[] {
    return [];
  }

  async clear ({ conversationId, userId, keepStarred }: ClearChatDto): Promise<number> {
    const result = await this.service.getWriteConnection().query<HistoryCountDto>({ sql: SUPPORT_HISTORY.CLEAR_SQL, params: [conversationId, userId, keepStarred] });
    return result.rows[0]?.count ?? 0;
  }
}
