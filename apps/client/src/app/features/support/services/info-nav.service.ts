import { Injectable, inject, signal } from '@angular/core';

import { INFO_DIALOG } from '../constants/info-dialog.constant';
import { InfoPageRefDto } from '../interfaces/info-page-ref.interface';
import { SupportPanelStore } from '../../../core/services/support-panel.store';

@Injectable({ providedIn: 'root' })
export class InfoNavService {
  private readonly panel = inject(SupportPanelStore);
  private readonly pageSignal = signal<string>(INFO_DIALOG.PAGES.MAIN);

  readonly page = this.pageSignal.asReadonly();

  go ({ page }: InfoPageRefDto): void {
    this.pageSignal.set(page);
    this.panel.showStorage(page === INFO_DIALOG.PAGES.STORAGE);
  }

  back (): void {
    this.go({ page: INFO_DIALOG.PAGES.MAIN });
  }

  close (): void {
    this.pageSignal.set(INFO_DIALOG.PAGES.MAIN);
    this.panel.hide();
  }
}
