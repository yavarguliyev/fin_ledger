import { inject, provideAppInitializer } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors, withXhr } from '@angular/common/http';

import { App } from './app/app.component';
import { routes } from './app/app.routes';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';
import { requestTimeoutInterceptor } from './app/core/interceptors/request-timeout.interceptor';
import { readRetryInterceptor } from './app/core/interceptors/read-retry.interceptor';
import { AppConfigService } from './app/core/services/app-config.service';
import { SessionRefreshService } from './app/core/services/session-refresh.service';
import { responseCacheInterceptor } from './app/core/interceptors/response-cache.interceptor';
import { requestSharingInterceptor } from './app/core/interceptors/request-sharing.interceptor';
import { pageViewInterceptor } from './app/core/interceptors/page-view.interceptor';
import { PageViewTrackerService } from './app/core/services/page-view-tracker.service';

bootstrapApplication(App, {
  providers: [
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })),
    provideHttpClient(
      withXhr(),
      withInterceptors([responseCacheInterceptor, pageViewInterceptor, requestSharingInterceptor, authInterceptor, readRetryInterceptor, requestTimeoutInterceptor])
    ),
    provideAppInitializer(() => inject(PageViewTrackerService).listen()),
    provideAppInitializer(() => {
      const config = inject(AppConfigService);
      const refresh = inject(SessionRefreshService);
      return config.load().then(() => refresh.restore());
    })
  ]
}).catch((err: Error) => err);
