import { MfaCodeDto } from './mfa-code.interface';

export interface VerifyMfaLoginDto extends MfaCodeDto {
  challengeToken: string;
}
