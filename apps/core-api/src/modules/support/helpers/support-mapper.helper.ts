import { SupportConversationContract, SupportMessageContract } from '@common/libs';

import { ConversationRowRefDto } from '../dtos/conversation/conversation-row-ref.dto';
import { MessageRowRefDto } from '../dtos/message/message-row-ref.dto';
import { SupportAccessHelper } from './support-access.helper';

export class SupportMapperHelper {
  static toMessage ({ row }: MessageRowRefDto): SupportMessageContract {
    return {
      id: row.id,
      conversationId: row.conversationId,
      senderUserId: row.senderUserId,
      senderName: row.senderName ?? null,
      senderIsStaff: SupportAccessHelper.isStaff({ role: row.senderRole ?? '' }),
      kind: row.kind,
      source: row.source,
      body: row.body,
      attachment: null,
      editedAt: row.editedAt,
      deletedAt: row.deletedAt,
      seen: row.seen ?? false,
      createdAt: row.createdAt
    };
  }

  static toConversation ({ row }: ConversationRowRefDto): SupportConversationContract {
    return {
      id: row.id,
      customerUserId: row.customerUserId,
      customerName: row.customerName ?? null,
      assignedStaffId: row.assignedStaffId,
      assignedStaffName: row.assignedStaffName ?? null,
      subject: row.subject,
      status: row.status,
      unreadCount: row.unreadCount ?? 0,
      lastMessagePreview: row.lastMessagePreview ?? null,
      lastMessageAt: row.lastMessageAt,
      createdAt: row.createdAt
    };
  }
}
