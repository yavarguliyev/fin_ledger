import { Injectable, Signal, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { AppConfigService } from './app-config.service';
import { LINK_PREVIEW } from '../constants/support/link-preview.constant';
import { SUPPORT } from '../constants/support/support.constant';
import { LinkPreview } from '../interfaces/support/link-preview.interface';
import { LinkUrlDto } from '../interfaces/support/link-url.interface';

@Injectable({ providedIn: 'root' })
export class SupportLinkStore {
  private readonly config = inject(AppConfigService);
  private readonly http = inject(HttpClient);
  private readonly previews = new Map<string, Signal<LinkPreview | null>>();

  preview ({ url }: LinkUrlDto): Signal<LinkPreview | null> {
    const known = this.previews.get(url);
    if (known) return known;

    const state = signal<LinkPreview | null>(null);
    this.previews.set(url, state.asReadonly());
    this.http
      .get<LinkPreview>(`${this.config.apiUrl}${SUPPORT.BASE_PATH}${LINK_PREVIEW.PATH}`, { params: { url } })
      .subscribe({ next: preview => state.set(preview), error: () => state.set(null) });
    return state.asReadonly();
  }
}
