import { Module } from '@nestjs/common';
import { EnvModule, TasksModule } from '@common/libs';

import { CoreModule } from './modules/core.module';
import { WORKER } from './shared/constants/modules/worker.constant';

@Module({
  imports: [EnvModule, CoreModule, TasksModule.forRoot({ pollMs: WORKER.POLL_MS, batchSize: WORKER.BATCH_SIZE })]
})
export class WorkerModule {}
