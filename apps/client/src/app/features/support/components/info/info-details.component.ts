import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { DatePipe } from '@angular/common';

import { INFO_DIALOG } from '../../constants/info-dialog.constant';
import { INFO_PANEL } from '../../constants/info-panel.constant';
import { SupportPanelStore } from '../../../../core/services/support-panel.store';

@Component({
  selector: 'app-info-details',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe],
  templateUrl: '../../templates/info/info-details.component.html'
})
export class InfoDetailsComponent {
  readonly panel = inject(SupportPanelStore);
  readonly card = INFO_DIALOG.CARD;
  readonly labels = INFO_PANEL;
  readonly emptyValue = INFO_DIALOG.EMPTY_VALUE;
}
