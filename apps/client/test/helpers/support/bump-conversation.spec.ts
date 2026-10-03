import { SupportChatHelper } from '../../../src/app/core/helpers/support/support-chat.helper';
import { SupportConversation } from '../../../src/app/core/types/support/support-conversation.type';
import { SupportMessage } from '../../../src/app/core/types/support/support-message.type';
import { BUMP_CONVERSATION_TEST as T } from '../../constants/bump-conversation.constant';
import { aSupportConversation, aSupportMessage, anAttachment } from '../../fakes/support.fake';

const conversation = (id: string): SupportConversation => aSupportConversation({ id, unreadCount: 0, lastMessagePreview: null, lastMessageAt: T.EARLIER });

const message = (conversationId: string, senderUserId: string, attachment = false): SupportMessage =>
  aSupportMessage({
    conversationId,
    senderUserId,
    createdAt: T.NOW,
    body: attachment ? null : T.BODY,
    attachment: attachment ? anAttachment({ fileName: T.FILE_NAME }) : null
  });

const current = [conversation(T.FIRST), conversation(T.SECOND)];

describe('SupportChatHelper.bumpConversation', () => {
  it('counts a message from someone else as unread and moves its conversation to the top', () => {
    const [top, rest] = SupportChatHelper.bumpConversation({ current, message: message(T.SECOND, T.PEER), myUserId: T.ME, activeId: T.FIRST }) ?? [];

    expect(top).toMatchObject({ id: T.SECOND, unreadCount: 1, lastMessagePreview: T.BODY, lastMessageAt: T.NOW });
    expect(rest?.id).toBe(T.FIRST);
  });

  it('never counts my own message, or one in the conversation I have open, as unread', () => {
    expect(SupportChatHelper.bumpConversation({ current, message: message(T.SECOND, T.ME), myUserId: T.ME, activeId: T.FIRST })?.[0]?.unreadCount).toBe(0);
    expect(SupportChatHelper.bumpConversation({ current, message: message(T.FIRST, T.PEER), myUserId: T.ME, activeId: T.FIRST })?.[0]?.unreadCount).toBe(0);
  });

  it('previews an attachment by its file name, like the server does', () => {
    const [top] = SupportChatHelper.bumpConversation({ current, message: message(T.SECOND, T.PEER, true), myUserId: T.ME, activeId: null }) ?? [];

    expect(top?.lastMessagePreview).toBe(T.FILE_NAME);
  });

  it('asks for a reload when the conversation is not in the list yet', () => {
    expect(SupportChatHelper.bumpConversation({ current, message: message(T.UNKNOWN, T.PEER), myUserId: T.ME, activeId: null })).toBeNull();
  });
});
