import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { PostgresService } from '@common/database';
import { BaseHelper, RequestScope } from '@common/shared-libs';

import { ScheduledTask } from '../interfaces/scheduled-task.interface';
import { ScheduleLock } from '../interfaces/schedule-lock.interface';
import { JOB_SQL } from '../constants/jobs/job-sql.constant';

@Injectable()
export class TaskSchedulerService implements OnModuleDestroy {
  private readonly logger = new Logger(TaskSchedulerService.name);
  private readonly timers = new Map<string, ReturnType<typeof setInterval>>();

  constructor (@Inject(PostgresService) private readonly postgresService: PostgresService) {}

  onModuleDestroy (): void {
    this.timers.forEach(timer => clearInterval(timer));
    this.timers.clear();
  }

  schedule ({ name, everyMs, run }: ScheduledTask): void {
    if (this.timers.has(name)) return;

    this.timers.set(
      name,
      setInterval(() => void this.tick({ name, everyMs, run }), everyMs)
    );

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
