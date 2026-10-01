import { Component, ElementRef, computed, input, signal, viewChild } from '@angular/core';

import { CallNoticeHelper } from '../../../core/helpers/support/call-notice.helper';
import { SUPPORT_RECORDING } from '../../../core/constants/support/support-recording.constant';

@Component({
  selector: 'app-video-note',
  standalone: true,
  templateUrl: '../templates/video-note.component.html'
})
export class VideoNoteComponent {
  private readonly player = viewChild<ElementRef<HTMLVideoElement>>('player');

  readonly url = input.required<string>();
  readonly durationSeconds = input<number | null>(null);
  readonly labels = SUPPORT_RECORDING;
  readonly playing = signal(false);
  private previewed = false;

  readonly length = computed(() => CallNoticeHelper.elapsed({ since: Date.now() - (this.durationSeconds() ?? 0) * SUPPORT_RECORDING.MS_PER_SECOND }));

  showPreviewFrame (video: HTMLVideoElement): void {
    if (this.previewed || this.playing()) return;
    this.previewed = true;
    video.currentTime = (this.durationSeconds() ?? 0) * SUPPORT_RECORDING.PREVIEW_FRACTION;
  }

  toggle (): void {
    const video = this.player()?.nativeElement;
    if (!video) return;

    if (video.paused) {
      if (!this.playing() && video.ended) video.currentTime = 0;
      video.muted = false;
      void video.play();
    } else {
      video.pause();
    }
  }
}
