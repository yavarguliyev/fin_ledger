import { OtpSlotsDto } from './otp-slots.interface';

export interface OtpFillSlotsDto extends OtpSlotsDto {
  from: number;
  text: string;
}
