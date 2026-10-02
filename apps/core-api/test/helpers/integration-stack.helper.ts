import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { CryptoHelper } from '@common/shared-libs';

import { INTEGRATION_STACK as S } from '../constants/integration-stack.constant';
import { IntegrationStack } from '../interfaces/integration-stack.interface';
import { WaitForApi } from '../interfaces/wait-for-api.interface';
import { StackContainersHelper } from './stack-containers.helper';
import { StackDatabaseHelper } from './stack-database.helper';
import { StackEnvHelper } from './stack-env.helper';

export class IntegrationStackHelper {
  static async start (): Promise<IntegrationStack> {
    const [kafkaPort, apiPort] = await Promise.all([StackContainersHelper.freePort(), StackContainersHelper.freePort()]);
    const redisPassword = CryptoHelper.randomToken({ bytes: S.REDIS_PASSWORD_BYTES });
    const containers = await StackContainersHelper.startAll({ kafkaPort, redisPassword });
    const database = StackDatabaseHelper.prepare({ postgres: containers.postgres });
    const emailLinkKey = CryptoHelper.randomBytes({ bytes: S.KEY_BYTES }).toString(S.KEY_ENCODING);
    const stackEnv = { containers, database, kafkaPort, apiPort, redisPassword, emailLinkKey };

    const workDir = mkdtempSync(path.join(tmpdir(), S.WORK_DIR_PREFIX));
    const api = spawn(process.execPath, [path.join(StackDatabaseHelper.APP_DIR, S.API_ENTRY)], {
      cwd: workDir,
      env: StackEnvHelper.forApi(stackEnv),
      stdio: ['ignore', 'pipe', 'pipe']
    });

    const logs: string[] = [];
    api.stdout?.on('data', (chunk: Buffer) => logs.push(chunk.toString()));
    api.stderr?.on('data', (chunk: Buffer) => logs.push(chunk.toString()));

    await IntegrationStackHelper.waitForApi({ url: `http://${S.LOOPBACK}:${apiPort}${S.API_PREFIX}`, api, logs });
    StackEnvHelper.exportForTests(stackEnv);

    const { postgres, redis, rabbitmq, kafka, minio } = containers;
    return { api, containers: [postgres, redis, rabbitmq, kafka, minio], workDir };
  }

  static async stop ({ api, containers, workDir }: IntegrationStack): Promise<void> {
    if (api.exitCode === null) {
      api.kill('SIGTERM');
      await Promise.race([once(api, 'exit'), sleep(S.STOP_GRACE_MS)]);
    }

    await Promise.all(containers.map(container => container.stop()));
    rmSync(workDir, { recursive: true, force: true });
  }

  private static async waitForApi ({ url, api, logs }: WaitForApi): Promise<void> {
    const deadline = Date.now() + S.READY_TIMEOUT_MS;

    while (Date.now() < deadline) {
      if (api.exitCode !== null) throw new Error(`core-api exited during startup:\n${logs.join('')}`);

      const ready = await fetch(`${url}${S.READY_PATH}`).then(
        () => true,
        () => false
      );
      if (ready) return;

      await sleep(S.READY_POLL_MS);
    }

    throw new Error(`core-api did not become ready in time:\n${logs.join('')}`);
  }
}
