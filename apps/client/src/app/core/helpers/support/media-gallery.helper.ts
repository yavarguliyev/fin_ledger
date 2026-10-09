import { MessagesRefDto } from '../../interfaces/support/messages-ref.interface';
import { SUPPORT_ATTACHMENT } from '../../constants/support/support-attachment.constant';
import { SupportMessage } from '../../types/support/support-message.type';

export class MediaGalleryHelper {
  static items ({ messages }: MessagesRefDto): SupportMessage[] {
    return messages.filter(message => MediaGalleryHelper.isViewable(message));
  }

  private static isViewable (message: SupportMessage): boolean {
    if (!message.attachment || message.deletedAt) return false;
    if (message.kind === SUPPORT_ATTACHMENT.IMAGE_KIND) return true;
    return message.kind === SUPPORT_ATTACHMENT.VIDEO_KIND && !message.attachment.durationSeconds;
  }
}
