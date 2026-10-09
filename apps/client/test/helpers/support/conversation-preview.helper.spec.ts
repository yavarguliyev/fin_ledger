import { ConversationPreviewHelper } from '../../../src/app/core/helpers/support/conversation-preview.helper';
import { SUPPORT_MESSAGES } from '../../../src/app/core/constants/support/support-messages.constant';
import { CONVERSATION_PREVIEW_TEST as T } from '../../constants/conversation-preview.constant';
import { aSupportConversation } from '../../fakes/support.fake';

describe('ConversationPreviewHelper.text', () => {
  it('shows the last message like a WhatsApp chat row', () => {
    expect(ConversationPreviewHelper.text({ conversation: aSupportConversation({ lastMessagePreview: T.PREVIEW }) })).toBe(T.PREVIEW);
  });

  it('hides the text of a locked chat before privacy is considered', () => {
    const conversation = aSupportConversation({ lastMessagePreview: T.PREVIEW, locked: true, privacyEnabled: true });

    expect(ConversationPreviewHelper.text({ conversation })).toBe(SUPPORT_MESSAGES.LOCKED_PREVIEW);
  });

  it('hides the text when chat privacy is on', () => {
    const conversation = aSupportConversation({ lastMessagePreview: T.PREVIEW, privacyEnabled: true });

    expect(ConversationPreviewHelper.text({ conversation })).toBe(SUPPORT_MESSAGES.PRIVATE_PREVIEW);
  });
});
