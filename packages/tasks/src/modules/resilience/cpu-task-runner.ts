import { HttpStatus, Injectable } from '@nestjs/common';
import { Worker } from 'node:worker_threads';
import { availableParallelism } from 'node:os';
import { InfrastructureError } from '@common/shared-libs';

import { CpuTask } from '../interfaces/cpu-task.interface';
import { CPU_POOL } from '../constants/jobs/cpu-pool.constant';

@Injectable()
export class CpuTaskRunner {
  private readonly maxWorkers = Math.max(availableParallelism() - CPU_POOL.RESERVED_THREADS, CPU_POOL.MIN_WORKERS);
  private readonly queue: (() => void)[] = [];

  private active = 0;

  get inFlight (): number {
    return this.active;
  }

  async run<T> ({ file, input, timeoutMs = CPU_POOL.TIMEOUT_MS }: CpuTask): Promise<T> {
    if (this.active >= this.maxWorkers && this.queue.length >= CPU_POOL.QUEUE_LIMIT) {
      throw new InfrastructureError({
        message: CPU_POOL.QUEUE_FULL_MESSAGE,
        code: CPU_POOL.QUEUE_FULL_CODE,
        retryable: true,
        httpStatus: HttpStatus.SERVICE_UNAVAILABLE
      });
    }

    await this.waitForSlot();
    this.active += 1;

    try {
      return await CpuTaskRunner.execute<T>({ file, input, timeoutMs });
    } finally {
      this.active -= 1;
      this.queue.shift()?.();
    }
  }

  private async waitForSlot (): Promise<void> {
    while (this.active >= this.maxWorkers) {
      await new Promise<void>(resolve => this.queue.push(resolve));
    }
  }

  private static execute<T> ({ file, input, timeoutMs = CPU_POOL.TIMEOUT_MS }: CpuTask): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const worker = new Worker(file, { workerData: input });

      const timer = setTimeout(() => {
        void worker.terminate();

        reject(
          new InfrastructureError({
            message: CPU_POOL.TIMEOUT_MESSAGE,
            code: CPU_POOL.TIMEOUT_CODE,
            retryable: true,
            httpStatus: HttpStatus.GATEWAY_TIMEOUT
          })
        );
      }, timeoutMs);

      const settle = (fn: () => void): void => {
        clearTimeout(timer);
        fn();
      };

      worker.once('message', (value: T) => settle(() => resolve(value)));
      worker.once('error', (error: Error) => settle(() => reject(error)));
      worker.once('exit', code => {
        if (code === CPU_POOL.CLEAN_EXIT) return;
        const message = `${CPU_POOL.EXIT_MESSAGE} ${code}`;
        settle(() => reject(new InfrastructureError({ message, code: CPU_POOL.EXIT_CODE })));
      });
    });
  }
}
