import { Injectable, inject } from '@angular/core';

import { CallerRefDto } from '../interfaces/support/caller-ref.interface';
import { CallIdRefDto } from '../interfaces/support/call-id-ref.interface';
import { CallSessionService } from './call-session.service';
import { RecoverCallDto } from '../interfaces/support/recover-call.interface';
import { RenegotiateCallDto } from '../interfaces/support/renegotiate-call.interface';
import { SUPPORT_CALL } from '../constants/support/support-call.constant';
import { SupportCallApiService } from './support-call-api.service';

@Injectable({ providedIn: 'root' })
export class CallRestartService {
  private readonly api = inject(SupportCallApiService);
  private readonly session = inject(CallSessionService);
  private caller = false;
  private attempts = 0;
  private grace: ReturnType<typeof setTimeout> | null = null;

  begin ({ caller }: CallerRefDto): void {
    this.caller = caller;
    this.reset();
  }

  reset (): void {
    this.attempts = 0;
    if (this.grace) clearTimeout(this.grace);
    this.grace = null;
  }

  recover ({ callId, onFailed }: RecoverCallDto): void {
    if (!callId) return onFailed();

    if (this.caller && this.attempts < SUPPORT_CALL.RESTART_ATTEMPTS) {
      this.attempts += 1;
      this.offer({ callId }).catch(() => onFailed());
    }

    this.grace ??= setTimeout(() => {
      this.grace = null;
      onFailed();
    }, SUPPORT_CALL.RESTART_GRACE_MS);
  }

  async handle ({ callId, sdp, sdpType }: RenegotiateCallDto): Promise<void> {
    const peer = this.session.connection();
    await peer.setRemoteDescription({ type: sdpType, sdp });
    if (sdpType !== SUPPORT_CALL.SDP_OFFER) return;

    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    this.api.renegotiate({ callId, sdp: answer.sdp ?? '', sdpType: SUPPORT_CALL.SDP_ANSWER }).subscribe({ error: () => undefined });
  }

  private async offer ({ callId }: CallIdRefDto): Promise<void> {
    const peer = this.session.connection();
    const offer = await peer.createOffer({ iceRestart: true });
    await peer.setLocalDescription(offer);
    this.api.renegotiate({ callId, sdp: offer.sdp ?? '', sdpType: SUPPORT_CALL.SDP_OFFER }).subscribe({ error: () => undefined });
  }
}
