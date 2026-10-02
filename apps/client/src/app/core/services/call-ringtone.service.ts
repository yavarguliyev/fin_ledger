import { Injectable } from '@angular/core';

import { CALL_RINGTONE } from '../constants/support/call-ringtone.constant';
import { FrequencyRefDto } from '../interfaces/support/frequency-ref.interface';
import { RingRefDto } from '../interfaces/support/ring-ref.interface';

@Injectable({ providedIn: 'root' })
export class CallRingtoneService {
  private context: AudioContext | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;

  start ({ outgoing }: RingRefDto): void {
    this.stop();
    const hz = outgoing ? CALL_RINGTONE.OUTGOING_HZ : CALL_RINGTONE.INCOMING_HZ;
    this.play({ hz });
    this.timer = setInterval(() => this.play({ hz }), CALL_RINGTONE.CYCLE_MS);
  }

  stop (): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  private play ({ hz }: FrequencyRefDto): void {
    this.context ??= new AudioContext();
    const context = this.context;

    [0, CALL_RINGTONE.BEEP_MS + CALL_RINGTONE.GAP_MS].forEach(offset => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const at = context.currentTime + offset / CALL_RINGTONE.MS_PER_SECOND;

      oscillator.type = CALL_RINGTONE.WAVE;
      oscillator.frequency.value = hz;
      gain.gain.value = CALL_RINGTONE.VOLUME;
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(at);
      oscillator.stop(at + CALL_RINGTONE.BEEP_MS / CALL_RINGTONE.MS_PER_SECOND);
    });
  }
}
