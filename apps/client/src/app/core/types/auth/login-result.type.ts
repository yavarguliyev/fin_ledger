import { AuthResponse } from '../../interfaces/auth/auth-response.interface';
import { MfaChallenge } from '../../interfaces/auth/mfa-challenge.interface';

export type LoginResult = AuthResponse | MfaChallenge;
