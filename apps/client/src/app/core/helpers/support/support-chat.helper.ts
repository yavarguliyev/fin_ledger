import { CaughtErrorDto } from '../../interfaces/common/caught-error.interface';
import { ClearUnreadDto } from '../../interfaces/support/clear-unread.interface';
import { CombineMessagesDto } from '../../interfaces/support/combine-messages.interface';
import { HttpRequestError } from '../../errors/http-request.error';
import { SUPPORT_MESSAGES } from '../../constants/support/support-messages.constant';
import { FailureMessageDto } from '../../interfaces/support/failure-message.interface';
import { MarkSeenDto } from '../../interfaces/support/mark-seen.interface';
import { MergeMessagesDto } from '../../interfaces/support/merge-messages.interface';
import { MessageGroupDto } from '../../interfaces/support/message-group.interface';
import { MessageRefDto } from '../../interfaces/support/message-ref.interface';
import { MessagesRefDto } from '../../interfaces/support/messages-ref.interface';
import { SupportConversation } from '../../types/support/support-conversation.type';
import { SupportMessage } from '../../types/support/support-message.type';
import { UpsertConversationDto } from '../../interfaces/support/upsert-conversation.interface';

export class SupportChatHelper {
  static failureMessage ({ error, fallback }: FailureMessageDto): string {
    return error instanceof HttpRequestError && error.status === SUPPORT_MESSAGES.TOO_MANY_REQUESTS ? SUPPORT_MESSAGES.TOO_FAST : fallback;
  }

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

  static combine ({ current, page }: CombineMessagesDto): SupportMessage[] {
    const byId = new Map(current.map(message => [message.id, message]));
    page.forEach(message => {
      const existing = byId.get(message.id);
      byId.set(message.id, existing ? { ...message, seen: !!(existing.seen || message.seen) } : message);
    });
    return [...byId.values()].sort((left, right) => left.createdAt.localeCompare(right.createdAt));
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
