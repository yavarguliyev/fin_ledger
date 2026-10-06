import { ClientIds } from '@common/libs';

import { WorkerModule } from './worker.module';
import { AppBootstrap } from './shared/helpers/app-bootstrap.helper';

AppBootstrap.run({ module: WorkerModule, context: ClientIds.WORKER });
