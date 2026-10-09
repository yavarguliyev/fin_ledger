import { CHAT_ROW_PREVIEW } from '../../constants/support/chat-row-preview.constant';
import { ChatRowPreview } from '../../interfaces/support/chat-row-preview.interface';
import { ConversationPreviewHelper } from './conversation-preview.helper';
import { ConversationViewDto } from '../../interfaces/support/conversation-view.interface';
import { SUPPORT_MESSAGE_RULES } from '../../constants/support/support-message-rules.constant';

export class ChatRowPreviewHelper {
  static describe ({ conversation, myUserId }: ConversationViewDto): ChatRowPreview {
    const text = ConversationPreviewHelper.text({ conversation });
    if (conversation.locked || conversation.privacyEnabled) return { icon: null, text, ticks: CHAT_ROW_PREVIEW.TICKS.NONE };

    const kind = conversation.lastMessageKind;
    const mine = !!kind && conversation.lastMessageSenderId === myUserId;
    if (conversation.lastMessageDeleted) {
      return { icon: CHAT_ROW_PREVIEW.ICONS.DELETED, text: mine ? SUPPORT_MESSAGE_RULES.YOU_DELETED_TEXT : SUPPORT_MESSAGE_RULES.DELETED_TEXT, ticks: CHAT_ROW_PREVIEW.TICKS.NONE };
    }

    const ticks = mine && kind !== CHAT_ROW_PREVIEW.SYSTEM_KIND ? (conversation.lastMessageSeen ? CHAT_ROW_PREVIEW.TICKS.SEEN : CHAT_ROW_PREVIEW.TICKS.SENT) : CHAT_ROW_PREVIEW.TICKS.NONE;
    const media = kind ? CHAT_ROW_PREVIEW.MEDIA[kind as keyof typeof CHAT_ROW_PREVIEW.MEDIA] : undefined;
    if (media) return { icon: media.icon, text: conversation.lastMessagePreview ?? media.label, ticks };

    return { icon: kind === CHAT_ROW_PREVIEW.FILE_KIND ? CHAT_ROW_PREVIEW.ICONS.FILE : null, text, ticks };
  }
}
