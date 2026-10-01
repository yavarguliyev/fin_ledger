import { RegistrationResponseJSON } from '@simplewebauthn/browser';

export interface RegisterPasskeyDto {
  response: RegistrationResponseJSON;
  deviceLabel?: string;
}
