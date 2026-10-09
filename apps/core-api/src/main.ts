import { ENV_FILES } from '@common/shared-libs';
import { AwsConfigHelper } from '@common/secrets';

void AwsConfigHelper.load({ env: process.env, envFiles: [...ENV_FILES.PRECEDENCE] }).then(async () => {
  const { ClientIds, ApiHttpHelper, AppBootstrap } = await import('@common/libs');
  const { AppModule } = await import('./app.module');

  AppBootstrap.run({ module: AppModule, context: ClientIds.API_GATEWAY, http: ApiHttpHelper.configure });
});
