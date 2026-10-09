import { CHAT_FILTER } from '../../constants/support/chat-filter.constant';
import { ChatListDto } from '../../interfaces/support/chat-list.interface';
import { ConversationFilterDto } from '../../interfaces/support/conversation-filter.interface';
import { SupportConversation } from '../../types/support/support-conversation.type';

export class ChatListHelper {
  static arrange ({ conversations, filter }: ChatListDto): SupportConversation[] {
    const kept = conversations.filter(conversation => ChatListHelper.matches({ conversation, filter }));
    return [...kept.filter(item => item.pinnedAt).sort(ChatListHelper.byPin), ...kept.filter(item => !item.pinnedAt)];
  }

  static matches ({ conversation, filter }: ConversationFilterDto): boolean {
    if (filter === CHAT_FILTER.UNREAD) return (conversation?.unreadCount ?? 0) > 0;
    if (filter === CHAT_FILTER.FAVOURITES) return conversation?.favourite ?? false;
    return true;
  }

  static byPin (this: void, a: SupportConversation, b: SupportConversation): number {
    return (b.pinnedAt ?? '').localeCompare(a.pinnedAt ?? '');
  }
}
