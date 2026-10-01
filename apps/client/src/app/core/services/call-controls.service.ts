import { Injectable, computed, inject, signal } from '@angular/core';

import { CallSessionService } from './call-session.service';
import { CallStateService } from './call-state.service';

@Injectable({ providedIn: 'root' })
export class CallControlsService {
  private readonly session = inject(CallSessionService);
  private readonly state = inject(CallStateService);

  readonly canShareScreen = signal(typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getDisplayMedia);
  readonly sharing = computed(() => !!this.session.screenStream());

  toggleMute (): void {
    this.state.muted.set(!this.state.muted());
    this.session.setMicrophone({ enabled: !this.state.muted() });
  }

  toggleCamera (): void {
    this.state.cameraOff.set(!this.state.cameraOff());
    this.session.setCamera({ enabled: !this.state.cameraOff() });
  }

  async toggleScreenShare (): Promise<void> {
    if (this.sharing()) return this.session.stopScreenShare();

    await this.session.startScreenShare().catch(() => undefined);
  }

  reset (): void {
    void this.session.stopScreenShare();
  }
}
