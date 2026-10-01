import { OtpSlotsDto } from './otp-slots.dto';

export interface OtpWriteSlotsDto extends OtpSlotsDto {
  index: number;
  digit: string;
}
