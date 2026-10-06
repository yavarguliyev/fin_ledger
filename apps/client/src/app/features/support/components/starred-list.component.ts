import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';

import { INFO_PANEL } from '../constants/info-panel.constant';
import { STARRED_LIST } from '../constants/starred-list.constant';
import { StarredMessage } from '../../../core/interfaces/support/starred-message.interface';

@Component({
  selector: 'app-starred-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe],
  templateUrl: '../templates/starred-list.component.html'
})
export class StarredListComponent {
  readonly items = input<StarredMessage[]>([]);
  readonly picked = output<StarredMessage>();
  readonly labels = STARRED_LIST;
  readonly dateFormat = INFO_PANEL.DATE_FORMAT;
}
