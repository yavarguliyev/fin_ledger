import { LogExceptionRecord } from './log-exception-record.interface';

export interface CatchExceptionRecord extends LogExceptionRecord {
  readonly correlationId: string;
}
