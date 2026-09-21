import { SessionData } from './session-data.interface';

export interface ExpressReqFields extends SessionData {
  readonly url?: string;
}
