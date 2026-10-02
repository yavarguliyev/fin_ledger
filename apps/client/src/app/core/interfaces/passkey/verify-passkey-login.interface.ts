import { AuthenticationResponseJSON } from '@simplewebauthn/browser';

export interface VerifyPasskeyLoginDto {
  owner: string;
  response: AuthenticationResponseJSON;
}
