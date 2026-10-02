import { MfaCodeDto } from './mfa-code.interface';

export interface DisableMfaDto extends MfaCodeDto {
  password: string;
}
