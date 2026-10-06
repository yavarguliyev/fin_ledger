import { Inject, Injectable, Logger } from '@nestjs/common';
import { BackgroundTask, BackgroundWorker, BaseHelper, ProcessRole, RequestScope } from '@common/shared-libs';

import { JobRepository } from '../repositories/job.repository';
import { TaskRegistry } from './task-registry.service';
import { JobRef } from '../interfaces/job-ref.interface';
import { JobError } from '../interfaces/job-error.interface';
import { JobBackoffHelper } from '../helpers/job-backoff.helper';
import { TASKS_OPTIONS } from '../constants/jobs/tasks-options.constant';
import { TasksOptions } from '../interfaces/tasks-options.interface';
import { JOB } from '../constants/jobs/job.constant';

@Injectable()
@BackgroundWorker({ role: ProcessRole.WORKER })
export class TaskWorkerService implements BackgroundTask {
  private readonly logger = new Logger(TaskWorkerService.name);

  private timer: ReturnType<typeof setInterval> | null = null;
  private draining = false;

  constructor (
    @Inject(TASKS_OPTIONS) private readonly options: TasksOptions,
    private readonly jobRepository: JobRepository,
    private readonly registry: TaskRegistry
  ) {}

  start (): void {
    if (this.timer) return;
    this.timer = setInterval(() => void this.drain(), this.options.pollMs ?? JOB.DEFAULT_POLL_MS);
    this.logger.log('Task worker started');
  }

  stop (): void {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
  }

  async drain (): Promise<number> {
    if (this.draining) return 0;

    this.draining = true;

    try {
      const jobs = await this.jobRepository.claim({ size: this.options.batchSize ?? JOB.DEFAULT_BATCH_SIZE });

      for (const job of jobs) {
        await RequestScope.runSystem(() => this.runOne({ job }));
      }

      return jobs.length;
    } catch (error) {
      this.logger.error(`Task worker tick failed: ${BaseHelper.errorResponse({ error }).message}`);
      return 0;
    } finally {
      this.draining = false;
    }
  }


  private async runOne ({ job }: JobRef): Promise<void> {
    try {
      await this.registry.require({ name: job.name }).handle({ payload: job.payload });
      await this.jobRepository.complete({ jobId: job.id });
    } catch (error) {
      await this.recordFailure({ job, message: BaseHelper.errorResponse({ error }).message });
    }
  }

  private async recordFailure ({ job, message }: JobError): Promise<void> {
    if (job.attempts >= job.maxAttempts) {
      this.logger.error(`Task ${job.name} is dead after ${job.attempts} attempts: ${message}`);
      await this.jobRepository.bury({ job, message });
      return;
    }

    const delayMs = JobBackoffHelper.delayMs({ attempts: job.attempts });
    this.logger.warn(`Task ${job.name} failed (attempt ${job.attempts}); retrying in ${delayMs}ms: ${message}`);

    await this.jobRepository.reschedule({ jobId: job.id, message, delayMs });
  }
}
