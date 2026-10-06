import { ClientIds } from '@common/libs';

import { AppModule } from './app.module';
import { ApiHttpHelper } from './shared/helpers/api-http.helper';
import { AppBootstrap } from './shared/helpers/app-bootstrap.helper';

AppBootstrap.run({ module: AppModule, context: ClientIds.API_GATEWAY, http: ApiHttpHelper.configure });
