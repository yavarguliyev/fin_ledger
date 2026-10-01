import { Injectable } from '@nestjs/common';
import { BaseExtendedRepository, PostgresService } from '@common/libs';

import { ConversationRefDto } from '../dtos/input/conversation-ref.dto';
import { ListConversationsDto } from '../dtos/input/list-conversations.dto';
import { MarkReadDto } from '../dtos/input/mark-read.dto';
import { OpenConversationDto } from '../dtos/input/open-conversation.dto';
import { SUPPORT } from '../constants/chat/support.constant';
import { SUPPORT_SQL } from '../constants/chat/support-sql.constant';
import { SupportConversationDto } from '../dtos/conversation/support-conversation.dto';
import { AssignStaffDto } from '../dtos/input/assign-staff.dto';
import { SupportAccessHelper } from '../helpers/support-access.helper';

@Injectable()
export class SupportConversationRepository extends BaseExtendedRepository<SupportConversationDto> {
  constructor (postgresService: PostgresService) {
    super({
      service: postgresService,
      tableName: 'support_conversations',
      columnMappings: {
        customerUserId: 'customer_user_id',
        assignedStaffId: 'assigned_staff_id',
        lastMessageAt: 'last_message_at',
        createdAt: 'created_at',
        updatedAt: 'updated_at'
      }
    });
  }

  protected getSelectColumns (): string[] {
    return ['id', 'customerUserId', 'assignedStaffId', 'subject', 'status', 'lastMessageAt', 'createdAt'];
  }

  async touch ({ conversationId }: ConversationRefDto): Promise<void> {
    await this.service.getWriteConnection().query({ sql: SUPPORT_SQL.TOUCH_CONVERSATION, params: [conversationId] });
  }

  async claim ({ conversationId, staffUserId }: AssignStaffDto): Promise<void> {
    await this.service.getWriteConnection().query({ sql: SUPPORT_SQL.ASSIGN_STAFF, params: [conversationId, staffUserId] });
  }

  async openOrGet ({ userId, subject, staffUserId }: OpenConversationDto): Promise<string | null> {
    const result = await this.service.getWriteConnection().query<{ id: string }>({
      sql: SUPPORT_SQL.OPEN_OR_CREATE,
      params: [userId, subject ?? SUPPORT.DEFAULT_SUBJECT, staffUserId]
    });

    return result.rows[0]?.id ?? null;
  }

  async markRead ({ conversationId, userId, lastReadMessageId }: MarkReadDto): Promise<void> {
    await this.service.getWriteConnection().query({
      sql: SUPPORT_SQL.MARK_READ,
      params: [conversationId, userId, lastReadMessageId ?? null]
    });
  }

  async listForActor ({ actorId, role, limit, offset }: ListConversationsDto): Promise<SupportConversationDto[]> {
    const result = await this.service.getWriteConnection().query<SupportConversationDto>({
      sql: SUPPORT_SQL.LIST_CONVERSATIONS,
      params: [actorId, limit ?? SUPPORT.CONVERSATION_PAGE_SIZE, offset ?? 0, SupportAccessHelper.isStaff({ role })]
    });

    return result.rows;
  }
}
