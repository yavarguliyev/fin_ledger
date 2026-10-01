import { OtpSlotsDto } from './otp-slots.dto';

export interface OtpFillSlotsDto extends OtpSlotsDto {
  from: number;
  text: string;
}
