import type { TaskPayloadDto } from '../dtos/handler/task-payload.dto';

export interface TaskHandler {
  handle(dto: TaskPayloadDto): Promise<void>;
}
