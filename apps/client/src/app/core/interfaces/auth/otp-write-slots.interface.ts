import { OtpSlotsDto } from './otp-slots.interface';

export interface OtpWriteSlotsDto extends OtpSlotsDto {
  index: number;
  digit: string;
}
