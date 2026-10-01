import { RefreshRecord } from './refresh-record.interface';

export interface RotatedRefresh {
  readonly record: RefreshRecord;
  readonly refreshToken: string;
}
