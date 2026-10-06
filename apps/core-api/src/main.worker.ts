import { ENV_FILES } from '@common/shared-libs';
import { SecretsLoader } from '@common/secrets';

void SecretsLoader.load({ env: process.env, envFiles: [...ENV_FILES.PRECEDENCE] }).then(async () => {
  const { ClientIds, AppBootstrap } = await import('@common/libs');
  const { WorkerModule } = await import('./worker.module');

  AppBootstrap.run({ module: WorkerModule, context: ClientIds.WORKER });
});
