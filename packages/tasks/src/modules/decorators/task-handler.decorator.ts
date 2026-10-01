import { SetMetadata } from '@nestjs/common';

import { TaskHandlerOptionsDto } from '../dtos/handler/task-handler-options.dto';
import { JOB } from '../constants/jobs/job.constant';

export const HandlesTask = (options: TaskHandlerOptionsDto): MethodDecorator & ClassDecorator => SetMetadata(JOB.HANDLER_METADATA, options);
