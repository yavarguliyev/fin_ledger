import { CHAT_ROW_PREVIEW } from '../../../src/app/core/constants/support/chat-row-preview.constant';
import { ChatRowPreviewHelper } from '../../../src/app/core/helpers/support/chat-row-preview.helper';
import { SUPPORT_MESSAGES } from '../../../src/app/core/constants/support/support-messages.constant';
import { SUPPORT_MESSAGE_RULES } from '../../../src/app/core/constants/support/support-message-rules.constant';
import { SupportConversation } from '../../../src/app/core/types/support/support-conversation.type';
import { CHAT_ROW_PREVIEW_TEST as T } from '../../constants/chat-row-preview.constant';
import { aSupportConversation } from '../../fakes/support.fake';

const describeRow = (overrides: Partial<SupportConversation>): ReturnType<typeof ChatRowPreviewHelper.describe> =>
  ChatRowPreviewHelper.describe({ conversation: aSupportConversation(overrides), myUserId: T.ME });

describe('ChatRowPreviewHelper.describe', () => {
  it('shows grey ticks on my delivered message and blue ticks once read', () => {
    expect(describeRow({ lastMessageSenderId: T.ME, lastMessageKind: T.TEXT_KIND, lastMessagePreview: T.TEXT })).toEqual({ icon: null, text: T.TEXT, ticks: CHAT_ROW_PREVIEW.TICKS.SENT });
    expect(describeRow({ lastMessageSenderId: T.ME, lastMessageKind: T.TEXT_KIND, lastMessageSeen: true }).ticks).toBe(CHAT_ROW_PREVIEW.TICKS.SEEN);
  });

  it('shows no ticks on messages from the other person or system notices', () => {
    expect(describeRow({ lastMessageSenderId: T.PEER, lastMessageKind: T.TEXT_KIND }).ticks).toBe(CHAT_ROW_PREVIEW.TICKS.NONE);
    expect(describeRow({ lastMessageSenderId: T.ME, lastMessageKind: T.SYSTEM_KIND }).ticks).toBe(CHAT_ROW_PREVIEW.TICKS.NONE);
  });

  it('labels media with an icon and uses the caption when there is one', () => {
    expect(describeRow({ lastMessageSenderId: T.PEER, lastMessageKind: T.IMAGE_KIND })).toMatchObject({ icon: 'photo', text: T.PHOTO });
    expect(describeRow({ lastMessageSenderId: T.PEER, lastMessageKind: T.IMAGE_KIND, lastMessagePreview: T.CAPTION }).text).toBe(T.CAPTION);
    expect(describeRow({ lastMessageSenderId: T.PEER, lastMessageKind: T.VOICE_KIND })).toMatchObject({ icon: 'voice', text: T.VOICE });
    expect(describeRow({ lastMessageSenderId: T.PEER, lastMessageKind: T.FILE_KIND, lastMessagePreview: T.FILE_NAME })).toMatchObject({ icon: 'file', text: T.FILE_NAME });
  });

  it('says who deleted the last message', () => {
    expect(describeRow({ lastMessageSenderId: T.ME, lastMessageKind: T.TEXT_KIND, lastMessageDeleted: true }).text).toBe(SUPPORT_MESSAGE_RULES.YOU_DELETED_TEXT);
    expect(describeRow({ lastMessageSenderId: T.PEER, lastMessageKind: T.TEXT_KIND, lastMessageDeleted: true }).text).toBe(SUPPORT_MESSAGE_RULES.DELETED_TEXT);
  });

  it('hides everything behind chat lock', () => {
    expect(describeRow({ locked: true, lastMessageSenderId: T.ME, lastMessageKind: T.IMAGE_KIND })).toEqual({ icon: null, text: SUPPORT_MESSAGES.LOCKED_PREVIEW, ticks: CHAT_ROW_PREVIEW.TICKS.NONE });
  });
});
