import { INFO_DIALOG } from '../constants/info-dialog.constant';
import { MonthGroup } from '../interfaces/month-group.interface';
import { MonthItemsDto } from '../interfaces/month-items.interface';

export class MonthGroupHelper {
  static group<T extends { createdAt: string }> ({ items, now }: MonthItemsDto<T>): MonthGroup<T>[] {
    const groups = new Map<string, MonthGroup<T>>();

    for (const item of items) {
      const date = new Date(item.createdAt);
      const format = date.getFullYear() === now.getFullYear() ? INFO_DIALOG.MONTH_FORMAT : INFO_DIALOG.YEAR_MONTH_FORMAT;
      const label = new Intl.DateTimeFormat(INFO_DIALOG.LOCALE, format).format(date);
      const group = groups.get(label) ?? { label, items: [] };
      group.items.push(item);
      groups.set(label, group);
    }

    return [...groups.values()];
  }
}
