import { SetMetadata } from '@nestjs/common';

import { BACKGROUND_WORKER } from '../constants/lifecycle/background-worker.constant';
import { BackgroundWorkerOptionsDto } from '../dtos/background/background-worker-options.dto';

export const BackgroundWorker = ({ role }: BackgroundWorkerOptionsDto): ClassDecorator => SetMetadata(BACKGROUND_WORKER.ROLE_METADATA, role);
