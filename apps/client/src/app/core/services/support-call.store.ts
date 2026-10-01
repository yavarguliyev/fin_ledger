import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { MediaRefDto } from '../dtos/support/media-ref.dto';
import { CallNoticeDto } from '../dtos/support/call-notice.dto';
import { CallNoticeHelper } from '../helpers/support/call-notice.helper';
import { CallReasonDto } from '../dtos/support/call-reason.dto';
import { CallRingtoneService } from './call-ringtone.service';
import { CallControlsService } from './call-controls.service';
import { CallLinkService } from './call-link.service';
import { CallSessionService } from './call-session.service';
import { CallStateService } from './call-state.service';
import { CallSignal } from '../interfaces/support/call-signal.interface';
import { CallSignalRefDto } from '../dtos/support/call-signal-ref.dto';
import { PlaceCallDto } from '../dtos/support/place-call.dto';
import { StreamEventRefDto } from '../dtos/support/stream-event-ref.dto';
import { SUPPORT_CALL } from '../constants/support/support-call.constant';
import { SupportCallApiService } from './support-call-api.service';

@Injectable({ providedIn: 'root' })
export class SupportCallStore {
  private readonly api = inject(SupportCallApiService);
  private readonly session = inject(CallSessionService);
  private readonly ringtone = inject(CallRingtoneService);
  private readonly link = inject(CallLinkService);

  private incoming: CallSignal | null = null;
  private ringTimer: ReturnType<typeof setTimeout> | null = null;

  readonly state = inject(CallStateService);
  readonly localStream = this.session.localStream;
  readonly remoteStream = this.session.remoteStream;
  readonly remoteVideo = this.session.remoteVideo;
  readonly screenStream = this.session.screenStream;
  readonly controls = inject(CallControlsService);

  async place ({ conversationId, media, peerName }: PlaceCallDto): Promise<void> {
    if (this.state.busy()) return;
    this.state.begin({ phase: 'outgoing', media, peerName });

    try {
      await this.openLink({ media });
      const sdp = await this.session.offer();
      this.link.bind(await firstValueFrom(this.api.start({ conversationId, media, sdp })));
      this.ringtone.start({ outgoing: true });
      this.ringTimer = setTimeout(() => this.end({ reason: SUPPORT_CALL.MISSED }), SUPPORT_CALL.RING_TIMEOUT_MS);
    } catch (error) {
      this.finish({ notice: CallNoticeHelper.forFailure({ error }) });
    }
  }

  async accept (): Promise<void> {
    const call = this.incoming;
    if (!call?.sdp) return;

    this.ringtone.stop();
    this.state.phase.set('connecting');

    try {
      await this.openLink({ media: call.media });
      const sdp = await this.session.answer({ sdp: call.sdp });
      await firstValueFrom(this.api.answer({ callId: call.callId, sdp }));
    } catch (error) {
      this.end({ reason: SUPPORT_CALL.FAILED });
      this.state.notice.set(CallNoticeHelper.forFailure({ error }));
    }
  }

  decline (): void {
    this.end({ reason: SUPPORT_CALL.DECLINED });
  }

  hangUp (): void {
    this.end({ reason: this.state.phase() === 'outgoing' ? SUPPORT_CALL.MISSED : SUPPORT_CALL.HANGUP });
  }

  applyEvent ({ event }: StreamEventRefDto): void {
    const call = event.call;
    if (!call) return;

    if (event.type === SUPPORT_CALL.INCOMING_EVENT) return this.ring({ call });
    if (call.callId !== this.link.callId) return;

    if (event.type === SUPPORT_CALL.ANSWERED_EVENT && call.sdp) {
      this.clearRing();
      this.state.phase.set('connecting');
      void this.session.accept({ sdp: call.sdp });
    }

    if (event.type === SUPPORT_CALL.CANDIDATE_EVENT && call.candidate) void this.session.addCandidate({ candidate: call.candidate });
    if (event.type === SUPPORT_CALL.ENDED_EVENT) this.finish({ notice: CallNoticeHelper.forReason({ reason: call.reason }) });
  }

  reset (): void {
    if (this.link.callId && this.state.busy()) this.end({ reason: SUPPORT_CALL.HANGUP });
  }

  private ring ({ call }: CallSignalRefDto): void {
    if (this.state.busy()) {
      this.api.end({ callId: call.callId, reason: SUPPORT_CALL.BUSY }).subscribe({ error: () => undefined });
      return;
    }

    this.state.begin({ phase: 'incoming', media: call.media, peerName: call.fromName ?? '' });
    this.link.bind({ callId: call.callId });
    this.incoming = call;
    this.ringtone.start({ outgoing: false });
    this.ringTimer = setTimeout(() => this.finish({ notice: SUPPORT_CALL.MISSED_NOTICE }), SUPPORT_CALL.RING_TIMEOUT_MS);
  }

  private async openLink ({ media }: MediaRefDto): Promise<void> {
    await this.link.open({
      media,
      onConnected: () => this.markConnected(),
      onFailed: () => this.end({ reason: SUPPORT_CALL.FAILED })
    });
  }

  private markConnected (): void {
    if (this.state.connect()) this.clearRing();
  }

  private end ({ reason }: CallReasonDto): void {
    this.link.end({ reason });
    this.finish({ notice: CallNoticeHelper.forReason({ reason }) });
  }

  private finish ({ notice }: CallNoticeDto): void {
    this.clearRing();
    this.link.close();
    this.controls.reset();
    this.incoming = null;
    this.state.notice.set(notice);
    this.state.phase.set('ended');
    setTimeout(() => this.state.phase() === 'ended' && this.state.phase.set('idle'), SUPPORT_CALL.END_DELAY_MS);
  }

  private clearRing (): void {
    this.ringtone.stop();
    if (this.ringTimer) clearTimeout(this.ringTimer);
    this.ringTimer = null;
  }
}
