import { Injectable, computed, signal } from '@angular/core';

import { CallBeginDto } from '../interfaces/support/call-begin.interface';
import { CallMedia } from '../types/support/call-media.type';
import { CallPhase } from '../types/support/call-phase.type';
import { SUPPORT_CALL } from '../constants/support/support-call.constant';

@Injectable({ providedIn: 'root' })
export class CallStateService {
  readonly phase = signal<CallPhase>('idle');
  readonly media = signal<CallMedia>(SUPPORT_CALL.AUDIO);
  readonly peerName = signal('');
  readonly notice = signal('');
  readonly connectedAt = signal<number | null>(null);
  readonly muted = signal(false);
  readonly cameraOff = signal(false);
  readonly busy = computed(() => this.phase() !== 'idle');

  begin ({ phase, media, peerName }: CallBeginDto): void {
    this.phase.set(phase);
    this.media.set(media);
    this.peerName.set(peerName);
    this.notice.set('');
    this.muted.set(false);
    this.cameraOff.set(false);
    this.connectedAt.set(null);
  }

  connect (): boolean {
    if (this.connectedAt()) return false;
    this.phase.set('active');
    this.connectedAt.set(Date.now());
    return true;
  }
}
