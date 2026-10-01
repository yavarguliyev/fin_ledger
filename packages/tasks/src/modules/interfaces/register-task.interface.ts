import type { TaskHandler } from './task-handler.interface';

export interface RegisterTask {
  name: string;
  handler: TaskHandler;
}
