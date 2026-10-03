import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { CallIdDto } from '../interfaces/support/call-id.interface';
import { CallReasonDto } from '../interfaces/support/call-reason.interface';
import { CallSessionService } from './call-session.service';
import { CandidateRefDto } from '../interfaces/support/candidate-ref.interface';
import { OpenCallLinkDto } from '../interfaces/support/open-call-link.interface';
import { SUPPORT_CALL } from '../constants/support/support-call.constant';
import { SupportCallApiService } from './support-call-api.service';
import { CallRestartService } from './call-restart.service';
import { CallStateService } from './call-state.service';
import { CallSignalRefDto } from '../interfaces/support/call-signal-ref.interface';

@Injectable({ providedIn: 'root' })
export class CallLinkService {
  private readonly api = inject(SupportCallApiService);
  private readonly session = inject(CallSessionService);
  private readonly restart = inject(CallRestartService);
  private readonly state = inject(CallStateService);
  private outbound: RTCIceCandidateInit[] = [];

  callId: string | null = null;

  async open ({ media, onConnected, onFailed }: OpenCallLinkDto): Promise<void> {
    const { iceServers } = await firstValueFrom(this.api.callConfig());
    this.restart.begin({ caller: this.state.phase() === SUPPORT_CALL.OUTGOING_PHASE });

    await this.session.open({
      media,
      iceServers,
      onCandidate: candidate => this.send({ candidate }),
      onState: state => {
        if (state === SUPPORT_CALL.CONNECTED_STATE) {
          this.restart.reset();
          onConnected();
        }
        if (state === SUPPORT_CALL.DISCONNECTED_STATE || state === SUPPORT_CALL.FAILED_STATE) this.restart.recover({ callId: this.callId, onFailed });
      }
    });
  }

  bind ({ callId }: CallIdDto): void {
    this.callId = callId;
    const queued = this.outbound;
    this.outbound = [];
    queued.forEach(candidate => this.send({ candidate }));
  }

  send ({ candidate }: CandidateRefDto): void {
    if (!this.callId) {
      this.outbound.push(candidate);
      return;
    }

    this.api.candidate({ callId: this.callId, candidate }).subscribe({ error: () => undefined });
  }

  end ({ reason }: CallReasonDto): void {
    if (this.callId) this.api.end({ callId: this.callId, reason }).subscribe({ error: () => undefined });
  }

  renegotiate ({ call }: CallSignalRefDto): void {
    if (!this.callId || !call.sdp || !call.sdpType) return;
    this.restart.handle({ callId: this.callId, sdp: call.sdp, sdpType: call.sdpType }).catch(() => undefined);
  }

  close (): void {
    this.restart.reset();
    this.session.close();
    this.callId = null;
    this.outbound = [];
  }
}
