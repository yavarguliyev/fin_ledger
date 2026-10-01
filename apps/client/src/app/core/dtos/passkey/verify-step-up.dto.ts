import { AuthenticationResponseJSON } from '@simplewebauthn/browser';

export interface VerifyStepUpDto {
  response: AuthenticationResponseJSON;
}
