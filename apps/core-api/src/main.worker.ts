import { ClientIds, AppBootstrap } from '@common/libs';

import { WorkerModule } from './worker.module';

AppBootstrap.run({ module: WorkerModule, context: ClientIds.WORKER });
