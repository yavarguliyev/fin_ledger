import { CaughtErrorDto } from '../../dtos/common/caught-error.dto';
import { ClearUnreadDto } from '../../dtos/support/clear-unread.dto';
import { HttpRequestError } from '../../errors/http-request.error';
import { MarkSeenDto } from '../../dtos/support/mark-seen.dto';
import { MergeMessagesDto } from '../../dtos/support/merge-messages.dto';
import { MessageGroupDto } from '../../dtos/support/message-group.dto';
import { MessageRefDto } from '../../dtos/support/message-ref.dto';
import { MessagesRefDto } from '../../dtos/support/messages-ref.dto';
import { SupportConversation } from '../../types/support/support-conversation.type';
import { SupportMessage } from '../../types/support/support-message.type';
import { UpsertConversationDto } from '../../dtos/support/upsert-conversation.dto';

export class SupportChatHelper {
  static isSilent ({ error }: CaughtErrorDto): boolean {
    return error instanceof HttpRequestError && error.silent;
  }

  static clearUnread ({ current, conversationId }: ClearUnreadDto): SupportConversation[] {
    return current.map(item => (item.id === conversationId ? { ...item, unreadCount: 0 } : item));
  }

  static markSeen ({ current, readerUserId }: MarkSeenDto): SupportMessage[] {
    return current.map(message => (message.senderUserId === readerUserId ? message : { ...message, seen: true }));
  }

  static mergeMessages ({ current, incoming }: MergeMessagesDto): SupportMessage[] {
    if (current.some(message => message.id === incoming.id)) return current;
    return [...current, incoming].sort((left, right) => left.createdAt.localeCompare(right.createdAt));
  }

  static upsertMessage ({ current, incoming }: MergeMessagesDto): SupportMessage[] {
    const existing = current.find(message => message.id === incoming.id);
    if (!existing) return SupportChatHelper.mergeMessages({ current, incoming });

    return current.map(message => (message.id === incoming.id ? { ...incoming, seen: !!(existing.seen || incoming.seen) } : message));
  }

  static upsertConversation ({ current, incoming }: UpsertConversationDto): SupportConversation[] {
    const without = current.filter(item => item.id !== incoming.id);
    return [incoming, ...without];
  }

  static groupByDay ({ messages }: MessagesRefDto): MessageGroupDto[] {
    return messages.reduce<MessageGroupDto[]>((groups, message) => {
      const dayLabel = SupportChatHelper.dayLabelOf({ message });
      const last = groups[groups.length - 1];

      if (last && last.dayLabel === dayLabel) last.messages.push(message);
      else groups.push({ dayLabel, messages: [message] });

      return groups;
    }, []);
  }

  private static dayLabelOf ({ message }: MessageRefDto): string {
    const created = new Date(message.createdAt);
    const today = new Date();
    const yesterday = new Date(today.getTime() - 86400000);

    if (created.toDateString() === today.toDateString()) return 'Today';
    if (created.toDateString() === yesterday.toDateString()) return 'Yesterday';

    return created.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  }
}
