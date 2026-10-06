import { CursorItemsDto } from '../../interfaces/support/cursor-items.interface';
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
}
