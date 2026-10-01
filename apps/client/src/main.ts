import { inject, provideAppInitializer } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { App } from './app/app.component';
import { routes } from './app/app.routes';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';
import { AppConfigService } from './app/core/services/app-config.service';
import { SessionRefreshService } from './app/core/services/session-refresh.service';

bootstrapApplication(App, {
  providers: [
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAppInitializer(() => {
      const config = inject(AppConfigService);
      const refresh = inject(SessionRefreshService);
      return config.load().then(() => refresh.restore());
    })
  ]
}).catch((err: Error) => err);
