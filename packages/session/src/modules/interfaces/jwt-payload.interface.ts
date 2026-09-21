import { SessionData } from './session-data.interface';

export interface JwtPayload extends SessionData {
  readonly jti: string;
}
