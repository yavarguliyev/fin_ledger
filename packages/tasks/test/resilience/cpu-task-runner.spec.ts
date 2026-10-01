import { InfrastructureError } from '@common/shared-libs';

import { CpuTaskRunner } from '../../src/modules/resilience/cpu-task-runner';
import { CPU_TASK_RUNNER_TEST } from '../constants/cpu-task-runner.constant';

describe('CpuTaskRunner', () => {
  const runner = new CpuTaskRunner();

  it('rejects a task that outlives its timeout with a retryable infrastructure error', async () => {
    const run = runner.run({ file: CPU_TASK_RUNNER_TEST.HANG_WORKER, timeoutMs: CPU_TASK_RUNNER_TEST.SHORT_TIMEOUT_MS });

    await expect(run).rejects.toBeInstanceOf(InfrastructureError);
    await expect(run).rejects.toMatchObject({
      code: CPU_TASK_RUNNER_TEST.TIMEOUT_CODE,
      retryable: true,
      httpStatus: CPU_TASK_RUNNER_TEST.GATEWAY_TIMEOUT
    });
  });

  it('rejects a worker that exits uncleanly with a non-retryable infrastructure error', async () => {
    const run = runner.run({ file: CPU_TASK_RUNNER_TEST.CRASH_WORKER });

    await expect(run).rejects.toBeInstanceOf(InfrastructureError);
    await expect(run).rejects.toMatchObject({ code: CPU_TASK_RUNNER_TEST.EXIT_CODE, retryable: false });
  });

  it('frees its slot after a failure', async () => {
    await runner.run({ file: CPU_TASK_RUNNER_TEST.CRASH_WORKER }).catch(() => undefined);

    expect(runner.inFlight).toBe(0);
  });
});
