import { MfaCodeDto } from './mfa-code.dto';

export interface VerifyMfaLoginDto extends MfaCodeDto {
  challengeToken: string;
}
