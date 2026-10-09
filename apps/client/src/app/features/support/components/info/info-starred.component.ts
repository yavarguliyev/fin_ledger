import { Component, ChangeDetectionStrategy, inject, output } from '@angular/core';
import { DatePipe } from '@angular/common';

import { INFO_DIALOG } from '../../constants/info-dialog.constant';
import { INFO_PANEL } from '../../constants/info-panel.constant';
import { SupportStarStore } from '../../../../core/services/support-star.store';

@Component({
  selector: 'app-info-starred',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe],
  templateUrl: '../../templates/info/info-starred.component.html'
})
export class InfoStarredComponent {
  readonly stars = inject(SupportStarStore);
  readonly jump = output<string>();
  readonly card = INFO_DIALOG.CARD;
  readonly labels = INFO_PANEL;
}
