import { Injectable } from '@nestjs/common';

import { PostgresService } from '../services/postgres.service';
import { InboxLookupDto } from '../../dtos/inbox/inbox-lookup.dto';
import { InboxMessageDto } from '../../dtos/inbox/inbox-message.dto';
import { INBOX_CONSTANTS } from '../../constants/inbox/inbox.constant';

@Injectable()
export class InboxRepository {
  constructor (private readonly postgresService: PostgresService) {}

  async wasProcessed ({ consumer, messageId, adapter }: InboxLookupDto): Promise<boolean> {
    const db = adapter ?? this.postgresService.getConnection();
    const result = await db.query({ sql: INBOX_CONSTANTS.WAS_PROCESSED_SQL, params: [consumer, messageId] });

    return result.rows.length > 0;
  }

  async markProcessed ({ consumer, messageId, topic, adapter }: InboxMessageDto): Promise<boolean> {
    const db = adapter ?? this.postgresService.getConnection();
    const result = await db.query({ sql: INBOX_CONSTANTS.MARK_PROCESSED_SQL, params: [consumer, messageId, topic] });

    return result.rows.length > 0;
  }
}
