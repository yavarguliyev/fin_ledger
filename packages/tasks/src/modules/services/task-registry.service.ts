import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { TaskHandler } from '../interfaces/task-handler.interface';
import { RegisterTask } from '../interfaces/register-task.interface';
import { TaskName } from '../interfaces/task-name.interface';
import { JOB } from '../constants/jobs/job.constant';

@Injectable()
export class TaskRegistry {
  private readonly logger = new Logger(TaskRegistry.name);
  private readonly handlers = new Map<string, TaskHandler>();

  has ({ name }: TaskName): boolean {
    return this.handlers.has(name);
  }

  register ({ name, handler }: RegisterTask): void {
    this.handlers.set(name, handler);
    this.logger.log(`Registered task handler ${name}`);
  }

  require ({ name }: TaskName): TaskHandler {
    const handler = this.handlers.get(name);
    if (!handler) throw new NotFoundException(`${JOB.NO_HANDLER_MESSAGE} ${name}`);
    return handler;
  }
}
