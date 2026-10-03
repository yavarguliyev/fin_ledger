import { Component, ChangeDetectionStrategy, ElementRef, computed, input, output, signal, viewChildren } from '@angular/core';

import { OTP } from '../../../core/constants/auth/otp.constant';
import { OtpHelper } from '../../../core/helpers/auth/otp.helper';
import { OtpFillDto } from '../../../core/interfaces/auth/otp-fill.interface';
import { OtpMoveDto } from '../../../core/interfaces/auth/otp-move.interface';
import { OtpWriteDto } from '../../../core/interfaces/auth/otp-write.interface';
import { OtpEventDto } from '../../../core/interfaces/ui/otp-event.interface';

@Component({
  selector: 'app-otp-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './otp-input.component.html'
})
export class OtpInputComponent {
  private readonly boxes = viewChildren<ElementRef<HTMLInputElement>>('box');
  private readonly digits = signal<string[]>([]);

  readonly length = input<number>(OTP.LENGTH);
  readonly disabled = input<boolean>(false);
  readonly invalid = input<boolean>(false);
  readonly label = input<string>('Authentication code');

  readonly valueChange = output<string>();
  readonly completed = output<string>();
  readonly slots = computed(() => Array.from({ length: this.length() }, (_slot, index) => index));

  digitAt (index: number): string {
    return this.digits()[index] ?? '';
  }

  startsGroup (index: number): boolean {
    return OtpHelper.startsGroup(index);
  }

  onInput ({ index, event }: OtpEventDto): void {
    const target = event.target as HTMLInputElement;
    const typed = OtpHelper.sanitize(target.value);

    if (!typed) {
      target.value = this.digitAt(index);
      return;
    }

    if (typed.length > 1) {
      this.fill({ from: index, text: typed });
      return;
    }

    this.write({ index, digit: typed });
    target.value = typed;
    this.focusAt(index + 1);
    this.publish();
  }

  onKeydown ({ index, event }: OtpEventDto<KeyboardEvent>): void {
    if (event.key === OTP.ARROW_LEFT) return this.move({ event, to: index - 1 });
    if (event.key === OTP.ARROW_RIGHT) return this.move({ event, to: index + 1 });
    if (event.key !== OTP.BACKSPACE) return;

    event.preventDefault();

    if (this.digitAt(index)) {
      this.write({ index, digit: '' });
      this.syncBox(index);
    } else {
      this.write({ index: index - 1, digit: '' });
      this.syncBox(index - 1);
      this.focusAt(index - 1);
    }

    this.publish();
  }

  onPaste ({ index, event }: OtpEventDto<ClipboardEvent>): void {
    const pasted = (event.clipboardData?.getData('text') ?? '').replace(OTP.DIGITS_ONLY, '');
    if (!pasted) return;

    event.preventDefault();
    this.fill({ from: index, text: pasted });
  }

  clear (): void {
    this.digits.set([]);
    this.slots().forEach(index => this.syncBox(index));
    this.focusAt(0);
  }

  private fill ({ from, text }: OtpFillDto): void {
    this.digits.set(OtpHelper.fill({ digits: this.digits(), from, text, length: this.length() }));
    this.slots().forEach(slot => this.syncBox(slot));
    this.focusAt(Math.min(from + text.length, this.length() - 1));
    this.publish();
  }

  private write ({ index, digit }: OtpWriteDto): void {
    this.digits.set(OtpHelper.write({ digits: this.digits(), index, digit, length: this.length() }));
  }

  private move ({ event, to }: OtpMoveDto): void {
    event.preventDefault();
    this.focusAt(to);
  }

  private focusAt (index: number): void {
    const bounded = Math.max(0, Math.min(index, this.length() - 1));
    this.boxes()[bounded]?.nativeElement.focus();
    this.boxes()[bounded]?.nativeElement.select();
  }

  private syncBox (index: number): void {
    const box = this.boxes()[index];
    if (box) box.nativeElement.value = this.digitAt(index);
  }

  private publish (): void {
    const digits = this.digits();
    const length = this.length();

    this.valueChange.emit(OtpHelper.value({ digits, length }));
    if (OtpHelper.isComplete({ digits, length })) this.completed.emit(OtpHelper.value({ digits, length }));
  }
}
