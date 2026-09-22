import { Injectable, inject } from '@angular/core';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { AppConfig } from '../interfaces/app/app-config.interface';
import { APP_CONFIG } from '../constants/app/app-config.constant';

@Injectable({ providedIn: 'root' })
export class AppConfigService {
  private readonly http = new HttpClient(inject(HttpBackend));
  private config: AppConfig | null = null;

  get apiUrl (): string {
    return this.loaded().apiUrl;
  }

  get stripePublishableKey (): string {
    return this.loaded().stripePublishableKey;
  }

  async load (): Promise<void> {
    const config = await firstValueFrom(this.http.get<Partial<AppConfig>>(APP_CONFIG.PATH));
    if (!config.apiUrl) throw new Error(APP_CONFIG.MISSING_API_URL);

    this.config = { apiUrl: config.apiUrl, stripePublishableKey: config.stripePublishableKey ?? '' };
  }

  private loaded (): AppConfig {
    if (!this.config) throw new Error(APP_CONFIG.NOT_LOADED);
    return this.config;
  }
}
