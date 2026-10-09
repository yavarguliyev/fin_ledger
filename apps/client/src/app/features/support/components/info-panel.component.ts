import { Component, ChangeDetectionStrategy, computed, inject, input, output, signal } from '@angular/core';

import { INFO_DIALOG } from '../constants/info-dialog.constant';
import { InfoDetailsComponent } from './info/info-details.component';
import { InfoMainComponent } from './info/info-main.component';
import { InfoMuteComponent } from './info/info-mute.component';
import { InfoClearComponent } from './info/info-clear.component';
import { InfoThemeComponent } from './info/info-theme.component';
import { InfoNavService } from '../services/info-nav.service';
import { InfoSettingComponent } from './info/info-setting.component';
import { InfoSharedComponent } from './info/info-shared.component';
import { InfoStarredComponent } from './info/info-starred.component';
import { InfoStorageComponent } from './info/info-storage.component';
import { SupportPanelStore } from '../../../core/services/support-panel.store';
import { MediaViewerService } from '../services/media-viewer.service';

@Component({
  selector: 'app-info-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InfoMainComponent, InfoSharedComponent, InfoStarredComponent, InfoStorageComponent, InfoSettingComponent, InfoDetailsComponent, InfoMuteComponent, InfoThemeComponent, InfoClearComponent],
  templateUrl: '../templates/info-panel.component.html',
  host: { '(document:keydown.escape)': 'onEscape()' }
})
export class InfoPanelComponent {
  readonly nav = inject(InfoNavService);
  private readonly viewer = inject(MediaViewerService);

  onEscape (): void {
    if (!this.viewer.current()) this.nav.close();
  }
  readonly panel = inject(SupportPanelStore);
  readonly online = input(false);
  readonly status = input('');
  readonly jump = output<string>();
  readonly labels = INFO_DIALOG;
  readonly pages = INFO_DIALOG.PAGES;
  readonly onMain = computed(() => this.nav.page() === INFO_DIALOG.PAGES.MAIN);
  readonly scrolled = signal(false);
  readonly title = computed(() => INFO_DIALOG.PAGE_TITLES[this.nav.page() as keyof typeof INFO_DIALOG.PAGE_TITLES] ?? '');

  onScroll (top: number): void {
    this.scrolled.set(top > INFO_DIALOG.TITLE_REVEAL_PX);
  }

  go (messageId: string): void {
    this.jump.emit(messageId);
    this.nav.close();
  }
}
