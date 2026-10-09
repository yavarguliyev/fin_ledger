import { ConversationItemDto } from '../../interfaces/support/conversation-item.interface';
import { SUPPORT_MESSAGES } from '../../constants/support/support-messages.constant';

export class ConversationPreviewHelper {
  static text ({ conversation }: ConversationItemDto): string {
    if (conversation.locked) return SUPPORT_MESSAGES.LOCKED_PREVIEW;
    if (conversation.privacyEnabled) return SUPPORT_MESSAGES.PRIVATE_PREVIEW;
    return conversation.lastMessagePreview ?? conversation.subject ?? SUPPORT_MESSAGES.NO_MESSAGES;
  }
}
