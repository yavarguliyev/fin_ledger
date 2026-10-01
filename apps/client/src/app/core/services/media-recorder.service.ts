import { Injectable, signal } from '@angular/core';

import { RecordedClipDto } from '../dtos/support/recorded-clip.dto';
import { RecordingHelper } from '../helpers/support/recording.helper';
import { RecordingKind } from '../types/support/recording-kind.type';
import { StartRecordingDto } from '../dtos/support/start-recording.dto';
import { SUPPORT_RECORDING } from '../constants/support/support-recording.constant';

@Injectable({ providedIn: 'root' })
export class MediaRecorderService {
  private recorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private limitTimer: ReturnType<typeof setTimeout> | null = null;

  readonly kind = signal<RecordingKind | null>(null);
  readonly startedAt = signal<number | null>(null);
  readonly preview = signal<MediaStream | null>(null);

  get supported (): boolean {
    return typeof MediaRecorder !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;
  }

  async start ({ kind, onLimit }: StartRecordingDto): Promise<void> {
    const stream = await navigator.mediaDevices.getUserMedia(RecordingHelper.constraints({ kind }));
    const mimeType = RecordingHelper.mimeType({ kind });
    const voice = kind === SUPPORT_RECORDING.VOICE;

    this.kind.set(kind);
    this.preview.set(voice ? null : stream);
    if (!voice) await new Promise(resolve => setTimeout(resolve, SUPPORT_RECORDING.WARMUP_MS));
    if (this.kind() !== kind) return stream.getTracks().forEach(track => track.stop());

    this.recorder = new MediaRecorder(stream, {
      ...(mimeType && { mimeType }),
      audioBitsPerSecond: SUPPORT_RECORDING.AUDIO_BITS,
      ...(!voice && { videoBitsPerSecond: SUPPORT_RECORDING.VIDEO_BITS })
    });
    this.chunks = [];
    this.recorder.ondataavailable = (event): void => {
      if (event.data.size > 0) this.chunks.push(event.data);
    };
    this.recorder.start(SUPPORT_RECORDING.TIMESLICE_MS);

    this.startedAt.set(Date.now());
    this.limitTimer = setTimeout(onLimit, voice ? SUPPORT_RECORDING.VOICE_MAX_MS : SUPPORT_RECORDING.VIDEO_MAX_MS);
  }

  async stop (): Promise<RecordedClipDto | null> {
    const recorder = this.recorder;
    const kind = this.kind();
    const startedAt = this.startedAt();
    if (!recorder || !kind || !startedAt) return null;

    await new Promise<void>(resolve => {
      recorder.onstop = (): void => resolve();
      recorder.stop();
    });

    const type = RecordingHelper.baseType({ type: recorder.mimeType || this.chunks[0]?.type || '' });
    const extension = type.split(SUPPORT_RECORDING.TYPE_SEPARATOR)[1] ?? '';
    const prefix = kind === SUPPORT_RECORDING.VOICE ? SUPPORT_RECORDING.VOICE_FILE_PREFIX : SUPPORT_RECORDING.VIDEO_FILE_PREFIX;
    const file = new File(this.chunks, `${prefix}-${Date.now()}${SUPPORT_RECORDING.EXTENSION_SEPARATOR}${extension}`, { type });
    const durationSeconds = Math.max(1, Math.round((Date.now() - startedAt) / SUPPORT_RECORDING.MS_PER_SECOND));

    this.release();
    return { file, durationSeconds };
  }

  cancel (): void {
    if (this.recorder && this.recorder.state !== SUPPORT_RECORDING.INACTIVE_STATE) this.recorder.stop();
    this.release();
  }

  private release (): void {
    if (this.limitTimer) clearTimeout(this.limitTimer);
    this.limitTimer = null;
    this.recorder?.stream.getTracks().forEach(track => track.stop());
    this.recorder = null;
    this.chunks = [];
    this.kind.set(null);
    this.startedAt.set(null);
    this.preview.set(null);
  }
}
