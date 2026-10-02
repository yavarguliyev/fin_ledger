import { OTP } from '../../constants/auth/otp.constant';
import { OtpSlotsDto } from '../../interfaces/auth/otp-slots.interface';
import { OtpWriteSlotsDto } from '../../interfaces/auth/otp-write-slots.interface';
import { OtpFillSlotsDto } from '../../interfaces/auth/otp-fill-slots.interface';

export class OtpHelper {
  static sanitize (text: string): string {
    return text.replace(OTP.DIGITS_ONLY, '');
  }

  static startsGroup (index: number): boolean {
    return index > 0 && index % OTP.GROUP_SIZE === 0;
  }

  static value ({ digits, length }: OtpSlotsDto): string {
    return Array.from({ length }, (_slot, index) => digits[index] ?? '').join('');
  }

  static isComplete ({ digits, length }: OtpSlotsDto): boolean {
    return OtpHelper.value({ digits, length }).length === length;
  }

  static write ({ digits, index, digit, length }: OtpWriteSlotsDto): string[] {
    if (index < 0 || index >= length) return digits;

    const next = [...digits];
    next[index] = digit;

    return next;
  }

  static fill ({ digits, from, text, length }: OtpFillSlotsDto): string[] {
    const next = [...digits];

    OtpHelper.sanitize(text)
      .split('')
      .forEach((digit, offset) => {
        const slot = from + offset;
        if (slot < length) next[slot] = digit;
      });

    return next;
  }
}
