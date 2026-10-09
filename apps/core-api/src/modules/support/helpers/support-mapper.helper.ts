import { SupportConversationContract, SupportMessageContract } from '@common/libs';

import { ConversationRowRefDto } from '../dtos/conversation/conversation-row-ref.dto';
import { MessageRowRefDto } from '../dtos/message/message-row-ref.dto';
import { SupportAccessHelper } from './support-access.helper';
import { SupportReplyHelper } from './support-reply.helper';
import { LastMessageFieldsDto } from '../dtos/conversation/last-message-fields.dto';
import { PreferenceFieldsDto } from '../dtos/conversation/preference-fields.dto';

export class SupportMapperHelper {
  static toMessage ({ row }: MessageRowRefDto): SupportMessageContract {
    const replyTo = SupportReplyHelper.fromRow({ row });

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
      createdAt: row.createdAt,
      ...(replyTo && { replyTo }),
      ...(row.reactions && { reactions: row.reactions })
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
      ...SupportMapperHelper.lastMessage({ row }),
      privacyEnabled: row.privacyEnabled ?? false,
      locked: row.locked ?? false,
      ...SupportMapperHelper.preferences({ row }),
      lastMessageAt: row.lastMessageAt,
      createdAt: row.createdAt
    };
  }

  private static lastMessage ({ row }: ConversationRowRefDto): LastMessageFieldsDto {
    return {
      lastMessagePreview: row.lastMessagePreview ?? null,
      lastMessageSenderId: row.lastMessageSenderId ?? null,
      lastMessageKind: row.lastMessageKind ?? null,
      lastMessageSeen: row.lastMessageSeen ?? false,
      lastMessageDeleted: row.lastMessageDeleted ?? false
    };
  }

  private static preferences ({ row }: ConversationRowRefDto): PreferenceFieldsDto {
    return {
      muted: row.muted ?? false,
      mutedUntil: row.mutedUntil ?? null,
      pinnedAt: row.pinnedAt ?? null,
      favourite: row.favourite ?? false,
      theme: row.theme ?? null
    };
  }
}
