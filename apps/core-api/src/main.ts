import { ClientIds, ApiHttpHelper, AppBootstrap } from '@common/libs';

import { AppModule } from './app.module';

AppBootstrap.run({ module: AppModule, context: ClientIds.API_GATEWAY, http: ApiHttpHelper.configure });
