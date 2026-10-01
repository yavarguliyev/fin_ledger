import { Injectable, signal } from '@angular/core';

import { CandidateRefDto } from '../dtos/support/candidate-ref.dto';
import { OpenCallSessionDto } from '../dtos/support/open-call-session.dto';
import { SdpRefDto } from '../dtos/support/sdp-ref.dto';
import { SUPPORT_CALL } from '../constants/support/support-call.constant';
import { ToggleRefDto } from '../dtos/support/toggle-ref.dto';
import { CallSenderHelper } from '../helpers/support/call-sender.helper';
import { TrackEventRefDto } from '../dtos/support/track-event-ref.dto';

@Injectable({ providedIn: 'root' })
export class CallSessionService {
  private peer: RTCPeerConnection | null = null;
  private pending: RTCIceCandidateInit[] = [];

  readonly localStream = signal<MediaStream | null>(null);
  readonly remoteStream = signal<MediaStream | null>(null);
  readonly remoteVideo = signal(false);
  readonly screenStream = signal<MediaStream | null>(null);

  async open ({ media, iceServers, onCandidate, onState }: OpenCallSessionDto): Promise<void> {
    const local = await navigator.mediaDevices.getUserMedia({ audio: true, video: media === SUPPORT_CALL.VIDEO });
    const peer = new RTCPeerConnection({ iceServers });

    local.getTracks().forEach(track => peer.addTrack(track, local));
    if (media !== SUPPORT_CALL.VIDEO) peer.addTransceiver(SUPPORT_CALL.VIDEO_TRACK, { direction: SUPPORT_CALL.SEND_RECEIVE });
    peer.onicecandidate = (event): void => {
      if (event.candidate) onCandidate(event.candidate.toJSON());
    };
    peer.ontrack = (event): void => this.watchRemote({ event });
    peer.onconnectionstatechange = (): void => onState(peer.connectionState);

    this.localStream.set(local);
    this.peer = peer;
  }

  async offer (): Promise<string> {
    const peer = this.require();
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    return offer.sdp ?? '';
  }

  async answer ({ sdp }: SdpRefDto): Promise<string> {
    const peer = this.require();
    await peer.setRemoteDescription({ type: SUPPORT_CALL.SDP_OFFER, sdp });
    peer.getTransceivers().forEach(transceiver => (transceiver.direction = SUPPORT_CALL.SEND_RECEIVE));
    await this.flush();
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    return answer.sdp ?? '';
  }

  async accept ({ sdp }: SdpRefDto): Promise<void> {
    await this.require().setRemoteDescription({ type: SUPPORT_CALL.SDP_ANSWER, sdp });
    await this.flush();
  }

  async addCandidate ({ candidate }: CandidateRefDto): Promise<void> {
    if (!this.peer?.remoteDescription) {
      this.pending.push(candidate);
      return;
    }

    await this.peer.addIceCandidate(candidate).catch(() => undefined);
  }

  setMicrophone ({ enabled }: ToggleRefDto): void {
    this.localStream()?.getAudioTracks().forEach(track => (track.enabled = enabled));
  }

  setCamera ({ enabled }: ToggleRefDto): void {
    this.localStream()?.getVideoTracks().forEach(track => (track.enabled = enabled));
  }

  async startScreenShare (): Promise<void> {
    const screen = await navigator.mediaDevices.getDisplayMedia({
      video: { frameRate: SUPPORT_CALL.SCREEN_FRAME_RATE },
      audio: false,
      selfBrowserSurface: SUPPORT_CALL.EXCLUDE,
      surfaceSwitching: SUPPORT_CALL.INCLUDE
    } as DisplayMediaStreamOptions);
    const [track] = screen.getVideoTracks();
    const sender = this.videoSender();
    if (!track || !sender) return screen.getTracks().forEach(item => item.stop());

    track.contentHint = SUPPORT_CALL.SCREEN_HINT;
    track.onended = (): void => void this.stopScreenShare();
    await sender.replaceTrack(track);
    await CallSenderHelper.tune({ sender, sharing: true });
    this.screenStream.set(screen);
  }

  async stopScreenShare (): Promise<void> {
    if (!this.screenStream()) return;

    this.screenStream()?.getTracks().forEach(track => track.stop());
    this.screenStream.set(null);

    const sender = this.videoSender();
    if (!sender) return;

    await sender.replaceTrack(this.localStream()?.getVideoTracks()[0] ?? null);
    await CallSenderHelper.tune({ sender, sharing: false });
  }

  close (): void {
    this.screenStream()?.getTracks().forEach(track => track.stop());
    this.screenStream.set(null);
    this.remoteVideo.set(false);
    this.localStream()?.getTracks().forEach(track => track.stop());
    this.peer?.close();
    this.peer = null;
    this.pending = [];
    this.localStream.set(null);
    this.remoteStream.set(null);
  }

  private async flush (): Promise<void> {
    const queued = this.pending;
    this.pending = [];
    for (const candidate of queued) await this.addCandidate({ candidate });
  }

  private watchRemote ({ event }: TrackEventRefDto): void {
    this.remoteStream.set(event.streams[0] ?? this.remoteStream() ?? new MediaStream([event.track]));
    if (event.track.kind !== SUPPORT_CALL.VIDEO_TRACK) return;

    this.remoteVideo.set(!event.track.muted);
    event.track.onunmute = (): void => this.remoteVideo.set(true);
    event.track.onmute = (): void => this.remoteVideo.set(false);
  }

  private videoSender (): RTCRtpSender | undefined {
    return CallSenderHelper.videoSender({ peer: this.peer });
  }

  private require (): RTCPeerConnection {
    if (!this.peer) throw new Error(SUPPORT_CALL.FAILED_NOTICE);
    return this.peer;
  }
}
