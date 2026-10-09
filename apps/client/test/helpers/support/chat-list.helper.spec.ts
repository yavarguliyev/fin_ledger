import { ChatListHelper } from '../../../src/app/core/helpers/support/chat-list.helper';
import { CHAT_FILTER } from '../../../src/app/core/constants/support/chat-filter.constant';
import { SupportConversation } from '../../../src/app/core/types/support/support-conversation.type';
import { CHAT_LIST_TEST as T } from '../../constants/chat-list.constant';
import { aSupportConversation } from '../../fakes/support.fake';

const list = (): SupportConversation[] => [
  aSupportConversation({ id: T.PLAIN, unreadCount: T.UNREAD }),
  aSupportConversation({ id: T.OLD_PIN, pinnedAt: T.EARLY }),
  aSupportConversation({ id: T.FAVOURITE, favourite: true }),
  aSupportConversation({ id: T.NEW_PIN, pinnedAt: T.LATE, unreadCount: T.UNREAD })
];

const ids = (conversations: SupportConversation[]): string[] => conversations.map(item => item.id);

describe('ChatListHelper.arrange', () => {
  it('puts the most recently pinned chats first and keeps the rest in order', () => {
    expect(ids(ChatListHelper.arrange({ conversations: list(), filter: CHAT_FILTER.ALL }))).toEqual([T.NEW_PIN, T.OLD_PIN, T.PLAIN, T.FAVOURITE]);
  });

  it('shows only chats with unread messages under Unread', () => {
    expect(ids(ChatListHelper.arrange({ conversations: list(), filter: CHAT_FILTER.UNREAD }))).toEqual([T.NEW_PIN, T.PLAIN]);
  });

  it('shows only favourites under Favourites', () => {
    expect(ids(ChatListHelper.arrange({ conversations: list(), filter: CHAT_FILTER.FAVOURITES }))).toEqual([T.FAVOURITE]);
  });

  it('treats a contact without a chat as matching only All', () => {
    expect(ChatListHelper.matches({ conversation: null, filter: CHAT_FILTER.ALL })).toBe(true);
    expect(ChatListHelper.matches({ conversation: null, filter: CHAT_FILTER.UNREAD })).toBe(false);
  });
});
