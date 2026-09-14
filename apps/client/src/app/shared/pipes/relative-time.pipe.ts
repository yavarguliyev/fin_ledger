import { Pipe } from '@angular/core';

import { DateUtil } from '../../core/helpers/date.helper';

@Pipe({ name: 'relativeTime', standalone: true })
export class RelativeTimePipe {
  transform (value: string | Date | null | undefined): string {
    return !value ? '-' : DateUtil.formatRelative(value);
  }
}
