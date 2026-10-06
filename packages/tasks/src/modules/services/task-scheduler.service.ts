import { Inject, Injectable, Logger } from '@nestjs/common';
import { PostgresService } from '@common/database';
import { BackgroundTask, BackgroundWorker, BaseHelper, ProcessRole, RequestScope } from '@common/shared-libs';

import { ScheduledTask } from '../interfaces/scheduled-task.interface';
import { ScheduleLock } from '../interfaces/schedule-lock.interface';
import { JOB_SQL } from '../constants/jobs/job-sql.constant';

@Injectable()
@BackgroundWorker({ role: ProcessRole.WORKER })
export class TaskSchedulerService implements BackgroundTask {
  private readonly logger = new Logger(TaskSchedulerService.name);
  private readonly tasks = new Map<string, ScheduledTask>();
  private readonly timers = new Map<string, ReturnType<typeof setInterval>>();
  private running = false;

  constructor (@Inject(PostgresService) private readonly postgresService: PostgresService) {}

  start (): void {
    this.running = true;
    this.tasks.forEach(task => this.arm(task));
  }

  stop (): void {
    this.running = false;
    this.timers.forEach(timer => clearInterval(timer));
    this.timers.clear();
  }

  schedule ({ name, everyMs, run }: ScheduledTask): void {
    if (this.tasks.has(name)) return;
    this.tasks.set(name, { name, everyMs, run });
    if (this.running) this.arm({ name, everyMs, run });
  }

  private arm ({ name, everyMs, run }: ScheduledTask): void {
    if (this.timers.has(name)) return;
    this.timers.set(name, setInterval(() => void this.tick({ name, everyMs, run }), everyMs));
    this.logger.log(`Scheduled ${name} every ${everyMs}ms`);
  }

  async tick ({ name, run }: ScheduledTask): Promise<boolean> {
    try {
      return await RequestScope.runSystem(() =>
        this.postgresService.getWriteConnection().transaction({
          callback: async adapter => {
            if (!(await TaskSchedulerService.acquire({ adapter, name }))) return false;
            await run();
            return true;
          }
        })
      );
    } catch (error) {
      this.logger.error(`Scheduled ${name} failed: ${BaseHelper.errorResponse({ error }).message}`);
      return false;
    }
  }

  private static async acquire ({ adapter, name }: ScheduleLock): Promise<boolean> {
    const result = await adapter.query<{ acquired: boolean }>({ sql: JOB_SQL.ADVISORY_LOCK, params: [name] });
    return result.rows[0]?.acquired === true;
  }
}
