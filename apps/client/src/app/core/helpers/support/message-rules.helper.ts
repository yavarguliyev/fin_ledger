import { MessageOwnerDto } from '../../interfaces/support/message-owner.interface';
import { MessageRefDto } from '../../interfaces/support/message-ref.interface';
import { SUPPORT_MESSAGE_RULES } from '../../constants/support/support-message-rules.constant';
import { SupportMessage } from '../../types/support/support-message.type';

export class MessageRulesHelper {
  static canEdit ({ message, userId }: MessageOwnerDto): boolean {
    if (SUPPORT_MESSAGE_RULES.RECORDED_KINDS.includes(message.kind)) return false;
    return MessageRulesHelper.ownLive({ message, userId }) && MessageRulesHelper.ageMs({ message }) <= SUPPORT_MESSAGE_RULES.EDIT_WINDOW_MS;
  }

  static canDeleteForEveryone ({ message, userId }: MessageOwnerDto): boolean {
    return MessageRulesHelper.ownLive({ message, userId }) && MessageRulesHelper.ageMs({ message }) <= SUPPORT_MESSAGE_RULES.DELETE_FOR_EVERYONE_WINDOW_MS;
  }

  static tombstone ({ message }: MessageRefDto): SupportMessage {
    return { ...message, body: null, attachment: null, deletedAt: new Date().toISOString() };
  }

  private static ownLive ({ message, userId }: MessageOwnerDto): boolean {
    return !!userId && message.senderUserId === userId && !message.deletedAt;
  }

  private static ageMs ({ message }: MessageRefDto): number {
    return Date.now() - new Date(message.createdAt).getTime();
  }
}
