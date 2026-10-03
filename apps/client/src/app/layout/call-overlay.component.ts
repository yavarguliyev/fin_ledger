import { Component, ChangeDetectionStrategy, OnDestroy, computed, inject, signal } from '@angular/core';

import { CallNoticeHelper } from '../core/helpers/support/call-notice.helper';
import { CallAnnouncementHelper } from '../core/helpers/support/call-announcement.helper';
import { SUPPORT_CALL } from '../core/constants/support/support-call.constant';
import { SupportCallStore } from '../core/services/support-call.store';
import { FocusTrapDirective } from '../shared/directives/focus-trap.directive';

@Component({
  selector: 'app-call-overlay',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FocusTrapDirective],
  templateUrl: './templates/call-overlay.component.html'
})
export class CallOverlayComponent implements OnDestroy {
  readonly call = inject(SupportCallStore);
  readonly state = this.call.state;
  readonly labels = SUPPORT_CALL;

  private readonly now = signal(Date.now());
  private readonly timer = setInterval(() => this.now.set(Date.now()), SUPPORT_CALL.TICK_MS);

  readonly video = computed(() => this.state.media() === SUPPORT_CALL.VIDEO);
  readonly initial = computed(() => this.state.peerName().charAt(0).toUpperCase());

  readonly status = computed(() => {
    const phase = this.state.phase();
    const since = this.state.connectedAt();

    if (phase === 'outgoing') return SUPPORT_CALL.CALLING;
    if (phase === 'incoming') return this.video() ? SUPPORT_CALL.INCOMING_VIDEO : SUPPORT_CALL.INCOMING_VOICE;
    if (phase === 'connecting') return SUPPORT_CALL.CONNECTING;
    if (phase === 'active' && since) return this.now() >= since ? CallNoticeHelper.elapsed({ since }) : '';
    return this.state.notice();
  });

  readonly announcement = computed(() =>
    CallAnnouncementHelper.from({ phase: this.state.phase(), status: this.status(), peerName: this.state.peerName() })
  );

  ngOnDestroy (): void {
    clearInterval(this.timer);
  }
}
