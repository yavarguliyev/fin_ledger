import { Component, OnDestroy, OnInit, computed, inject, input, output, signal } from '@angular/core';

import { CallNoticeHelper } from '../../../core/helpers/support/call-notice.helper';
import { MediaRecorderService } from '../../../core/services/media-recorder.service';
import { RecordedClipDto } from '../../../core/dtos/support/recorded-clip.dto';
import { RecordingKind } from '../../../core/types/support/recording-kind.type';
import { SUPPORT_RECORDING } from '../../../core/constants/support/support-recording.constant';

@Component({
  selector: 'app-recorder-bar',
  standalone: true,
  templateUrl: '../templates/recorder-bar.component.html'
})
export class RecorderBarComponent implements OnInit, OnDestroy {
  readonly recorder = inject(MediaRecorderService);
  readonly kind = input.required<RecordingKind>();
  readonly finished = output<RecordedClipDto>();
  readonly cancelled = output();
  readonly failed = output<string>();
  readonly labels = SUPPORT_RECORDING;

  private readonly now = signal(Date.now());
  private readonly timer = setInterval(() => this.now.set(Date.now()), SUPPORT_RECORDING.TICK_MS);

  readonly video = computed(() => this.kind() === SUPPORT_RECORDING.VIDEO);
  readonly elapsed = computed(() => {
    const since = this.recorder.startedAt();
    return since && this.now() >= since ? CallNoticeHelper.elapsed({ since }) : CallNoticeHelper.elapsed({ since: Date.now() });
  });

  ngOnInit (): void {
    void this.begin();
  }

  private async begin (): Promise<void> {
    if (!this.recorder.supported) return this.failed.emit(SUPPORT_RECORDING.NOT_SUPPORTED);

    try {
      await this.recorder.start({ kind: this.kind(), onLimit: () => void this.send() });
    } catch {
      this.failed.emit(SUPPORT_RECORDING.DENIED);
    }
  }

  ngOnDestroy (): void {
    clearInterval(this.timer);
    this.recorder.cancel();
  }

  async send (): Promise<void> {
    const clip = await this.recorder.stop();
    if (clip) this.finished.emit(clip);
  }

  cancel (): void {
    this.recorder.cancel();
    this.cancelled.emit();
  }
}
