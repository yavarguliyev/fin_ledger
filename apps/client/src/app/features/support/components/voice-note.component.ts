import { Component, ElementRef, computed, input, signal, viewChild } from '@angular/core';

import { CallNoticeHelper } from '../../../core/helpers/support/call-notice.helper';
import { SUPPORT_RECORDING } from '../../../core/constants/support/support-recording.constant';

@Component({
  selector: 'app-voice-note',
  standalone: true,
  templateUrl: '../templates/voice-note.component.html'
})
export class VoiceNoteComponent {
  private readonly player = viewChild<ElementRef<HTMLAudioElement>>('player');

  readonly url = input.required<string>();
  readonly durationSeconds = input<number | null>(null);
  readonly labels = SUPPORT_RECORDING;
  readonly playing = signal(false);
  readonly position = signal(0);

  readonly progress = computed(() => {
    const total = this.durationSeconds() ?? 0;
    return total > 0 ? Math.min(100, (this.position() / total) * 100) : 0;
  });

  readonly time = computed(() => {
    const seconds = this.playing() || this.position() > 0 ? this.position() : (this.durationSeconds() ?? 0);
    return CallNoticeHelper.elapsed({ since: Date.now() - seconds * SUPPORT_RECORDING.MS_PER_SECOND });
  });

  toggle (): void {
    const audio = this.player()?.nativeElement;
    if (!audio) return;

    if (audio.paused) void audio.play();
    else audio.pause();
  }

  onTime (audio: HTMLAudioElement): void {
    this.position.set(audio.currentTime);
  }

  onEnded (): void {
    this.playing.set(false);
    this.position.set(0);
  }
}
