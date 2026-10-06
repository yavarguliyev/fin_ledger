import { ConfigService } from '@nestjs/config';
import { DiscoveryService, Reflector } from '@nestjs/core';

import { BackgroundWorker } from '../../src/modules/decorators/background-worker.decorator';
import { ProcessRolesSchema } from '../../src/modules/dtos/background/process-roles.dto';
import { ProcessRole } from '../../src/modules/enums/common/process-role.enum';
import { BackgroundTask } from '../../src/modules/interfaces/background-task.interface';
import { BackgroundRunner } from '../../src/modules/lifecycle/background-runner';
import { BACKGROUND_RUNNER_SPEC as T } from '../constants/background-runner.constant';

const calls: string[] = [];

@BackgroundWorker({ role: ProcessRole.WORKER })
class Relay implements BackgroundTask {
  start (): void {
    calls.push(T.RELAY_START);
  }

  stop (): void {
    calls.push(T.RELAY_STOP);
  }
}

@BackgroundWorker({ role: ProcessRole.WORKER })
class Consumer implements BackgroundTask {
  start (): Promise<void> {
    calls.push(T.CONSUMER_START);
    return Promise.resolve();
  }

  stop (): Promise<void> {
    calls.push(T.CONSUMER_STOP);
    return Promise.resolve();
  }
}

@BackgroundWorker({ role: ProcessRole.API })
class Gateway implements BackgroundTask {
  start (): void {
    calls.push(T.GATEWAY_START);
  }

  stop (): void {
    calls.push(T.GATEWAY_START);
  }
}

class Plain {}

const runnerFor = (roles: ProcessRole[]): BackgroundRunner => {
  const providers = [new Relay(), new Gateway(), new Plain(), undefined, new Consumer()].map(instance => ({ instance }));
  const discovery = { getProviders: () => providers } as unknown as DiscoveryService;
  const config = { get: () => roles } as unknown as ConfigService;
  return new BackgroundRunner(discovery, new Reflector(), config);
};

beforeEach(() => calls.splice(0));

describe('BackgroundRunner', () => {
  it('starts only the workers whose role this process has, and stops them in reverse order', async () => {
    const runner = runnerFor([ProcessRole.WORKER]);

    await runner.onApplicationBootstrap();
    expect(calls).toEqual([T.RELAY_START, T.CONSUMER_START]);

    await runner.beforeApplicationShutdown();
    expect(calls).toEqual([T.RELAY_START, T.CONSUMER_START, T.CONSUMER_STOP, T.RELAY_STOP]);
  });

  it('stops each worker once even when stopAll runs before the shutdown hook', async () => {
    const runner = runnerFor([ProcessRole.WORKER]);

    await runner.onApplicationBootstrap();
    await runner.stopAll();
    await runner.beforeApplicationShutdown();
    expect(calls).toEqual([T.RELAY_START, T.CONSUMER_START, T.CONSUMER_STOP, T.RELAY_STOP]);
  });

  it('starts nothing for a role no worker has', async () => {
    const runner = runnerFor([ProcessRole.REPORTS]);

    await runner.onApplicationBootstrap();
    await runner.beforeApplicationShutdown();
    expect(calls).toEqual([]);
  });
});

describe('PROCESS_ROLES', () => {
  it('defaults to API and WORKER and reads a comma-separated list', () => {
    expect(ProcessRolesSchema.parse(undefined)).toEqual([ProcessRole.API, ProcessRole.WORKER]);
    expect(ProcessRolesSchema.parse(T.WORKER_ONLY)).toEqual([ProcessRole.WORKER]);
    expect(ProcessRolesSchema.parse(T.BOTH)).toEqual([ProcessRole.API, ProcessRole.WORKER]);
  });

  it('refuses an unknown role or an empty list', () => {
    expect(ProcessRolesSchema.safeParse(T.UNKNOWN).success).toBe(false);
    expect(ProcessRolesSchema.safeParse(T.EMPTY).success).toBe(false);
  });
});
