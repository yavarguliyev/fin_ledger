import { MfaCodeDto } from './mfa-code.dto';

export interface DisableMfaDto extends MfaCodeDto {
  password: string;
}
