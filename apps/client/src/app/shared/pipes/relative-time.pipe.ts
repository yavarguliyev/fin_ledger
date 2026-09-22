import { Pipe } from '@angular/core';
import { DateHelper } from '../../core/helpers/common/date.helper';


@Pipe({ name: 'relativeTime', standalone: true })
export class RelativeTimePipe {
  transform (value: string | Date | null | undefined): string {
    return !value ? '-' : DateHelper.formatRelative(value);
  }
}
