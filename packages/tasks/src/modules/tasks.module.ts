import { DynamicModule, Module } from '@nestjs/common';
import { DatabaseModule } from '@common/database';

import { JobRepository } from './repositories/job.repository';
import { TaskQueueService } from './services/task-queue.service';
import { TaskRegistry } from './services/task-registry.service';
import { TaskWorkerService } from './services/task-worker.service';
import { TaskSchedulerService } from './services/task-scheduler.service';
import { CpuTaskRunner } from './resilience/cpu-task-runner';
import { TasksOptions } from './interfaces/tasks-options.interface';
import { TASKS_OPTIONS } from './constants/jobs/tasks-options.constant';

const PROVIDERS = [JobRepository, TaskQueueService, TaskRegistry, TaskWorkerService, TaskSchedulerService, CpuTaskRunner];

@Module({})
export class TasksModule {
  static forRoot (options: TasksOptions = {}): DynamicModule {
    return {
      module: TasksModule,
      global: true,
      imports: [DatabaseModule],
      providers: [{ provide: TASKS_OPTIONS, useValue: options }, ...PROVIDERS],
      exports: PROVIDERS
    };
  }
}
