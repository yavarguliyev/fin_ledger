import { CursorItemsDto } from '../../interfaces/support/cursor-items.interface';
import { MessagesRefDto } from '../../interfaces/support/messages-ref.interface';
import { PanelCursorDto } from '../../interfaces/support/panel-cursor.interface';
import { SUPPORT_PANEL } from '../../constants/support/support-panel.constant';

export class PanelPagingHelper {
  static cursor ({ items }: CursorItemsDto): PanelCursorDto {
    const last = items.at(-1);
    return last ? { before: last.createdAt, beforeId: last.id } : {};
  }

  static hasMore ({ items }: CursorItemsDto): boolean {
    return items.length >= SUPPORT_PANEL.PAGE_SIZE;
  }

  static sharedSignature ({ messages }: MessagesRefDto): string {
    return messages
      .filter(message => message.attachment || SUPPORT_PANEL.LINK_PATTERN.test(message.body ?? ''))
      .map(message => `${message.id}${SUPPORT_PANEL.SIGNATURE_JOIN}${message.deletedAt ?? ''}`)
      .join(SUPPORT_PANEL.SIGNATURE_SEPARATOR);
  }
}
