import { BADGE } from '../../constants/ui/badge.constant';
import { BADGE_CLASSES } from '../../constants/ui/badge-class.constant';
import { BUTTON } from '../../constants/ui/button.constant';
import { FIELD } from '../../constants/ui/field.constant';
import { TABS } from '../../constants/ui/tabs.constant';
import { BadgeStatusDto } from '../../interfaces/ui/badge-status.interface';
import { ButtonClassesDto } from '../../interfaces/ui/button-classes.interface';
import { FieldClassesDto } from '../../interfaces/ui/field-classes.interface';
import { TabClassesDto } from '../../interfaces/ui/tab-classes.interface';
import { TabKeyDto } from '../../interfaces/ui/tab-key.interface';

export class UiPrimitiveHelper {
  static button ({ variant, fullWidth }: ButtonClassesDto): string {
    return [BUTTON.BASE, BUTTON.VARIANT_CLASSES[variant], ...(fullWidth ? [BUTTON.FULL_WIDTH] : [])].join(BUTTON.SEPARATOR);
  }

  static field ({ invalid }: FieldClassesDto): string {
    return [FIELD.CONTROL, ...(invalid ? [FIELD.INVALID] : [])].join(FIELD.SEPARATOR);
  }

  static badge ({ status }: BadgeStatusDto): string {
    return [BADGE.BASE, BADGE_CLASSES[status] ?? BADGE.FALLBACK].join(BADGE.SEPARATOR);
  }

  static tab ({ active }: TabClassesDto): string {
    return [TABS.TAB, active ? TABS.ACTIVE : TABS.INACTIVE].join(TABS.SEPARATOR);
  }

  static nextTab ({ key, index, count }: TabKeyDto): number | null {
    if ((TABS.NEXT_KEYS as readonly string[]).includes(key)) return (index + 1) % count;
    if ((TABS.PREVIOUS_KEYS as readonly string[]).includes(key)) return (index - 1 + count) % count;
    if (key === TABS.FIRST_KEY) return 0;
    if (key === TABS.LAST_KEY) return count - 1;
    return null;
  }
}
