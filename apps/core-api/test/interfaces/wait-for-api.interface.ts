import { ChildProcess } from 'node:child_process';

export interface WaitForApi {
  url: string;
  api: ChildProcess;
  logs: string[];
}
