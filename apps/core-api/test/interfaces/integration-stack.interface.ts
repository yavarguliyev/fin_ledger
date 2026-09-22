import { ChildProcess } from 'node:child_process';
import { StartedTestContainer } from 'testcontainers';

export interface IntegrationStack {
  api: ChildProcess;
  containers: StartedTestContainer[];
  workDir: string;
}
