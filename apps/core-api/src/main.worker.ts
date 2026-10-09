import { ENV_FILES } from '@common/shared-libs';
import { AwsConfigHelper } from '@common/secrets';

void AwsConfigHelper.load({ env: process.env, envFiles: [...ENV_FILES.PRECEDENCE] }).then(async () => {
  const { ClientIds, AppBootstrap } = await import('@common/libs');
  const { WorkerModule } = await import('./worker.module');

  AppBootstrap.run({ module: WorkerModule, context: ClientIds.WORKER });
});
