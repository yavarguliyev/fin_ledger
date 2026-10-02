import { DOCUMENT, Injectable, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

import { PAGE_VIEW } from '../constants/telemetry/page-view.constant';
import { PageViewHelper } from '../helpers/telemetry/page-view.helper';
import { RequestRefDto } from '../interfaces/telemetry/request-ref.interface';
import { PageViewSummary } from '../interfaces/telemetry/page-view-summary.interface';
import { PageViewStartDto } from '../interfaces/telemetry/page-view-start.interface';
import { AppConfigService } from './app-config.service';

@Injectable({ providedIn: 'root' })
export class PageViewTrackerService {
  private readonly router = inject(Router);
  private readonly config = inject(AppConfigService);
  private readonly document = inject(DOCUMENT);
  private route: string | null = null;
  private startedAt = 0;
  private seen = new Set<string>();
  private counts = { ...PAGE_VIEW.EMPTY_COUNTS };

  listen (): void {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.flush();
      this.begin({ route: PageViewHelper.routeTemplate({ root: this.router.routerState.snapshot.root }), fresh: true });
    });

    this.document.addEventListener(PAGE_VIEW.VISIBILITY_EVENT, () => {
      if (this.document.visibilityState !== PAGE_VIEW.HIDDEN) return;
      const route = this.route;
      this.flush();
      if (route) this.begin({ route, fresh: false });
    });
    this.document.defaultView?.addEventListener(PAGE_VIEW.PAGE_HIDE_EVENT, () => this.flush());
  }

  record ({ method, url }: RequestRefDto): void {
    if (!this.route || url.includes(PAGE_VIEW.PATH)) return;

    const key = [method, url].join(PAGE_VIEW.KEY_SEPARATOR);
    if (this.seen.has(key)) this.counts.duplicates += 1;
    this.seen.add(key);

    if (Date.now() - this.startedAt <= PAGE_VIEW.INITIAL_WINDOW_MS) this.counts.initialCalls += 1;
    else this.counts.laterCalls += 1;
  }

  private begin ({ route, fresh }: PageViewStartDto): void {
    this.route = route;
    this.startedAt = fresh ? Date.now() : PAGE_VIEW.STALE_START;
    this.seen = new Set<string>();
    this.counts = { ...PAGE_VIEW.EMPTY_COUNTS };
  }

  private flush (): void {
    if (!this.route) return;
    const summary: PageViewSummary = { route: this.route, ...this.counts };
    this.route = null;

    const url = `${this.config.apiUrl}${PAGE_VIEW.PATH}`;
    const body = JSON.stringify(summary);
    const sent = this.document.defaultView?.navigator.sendBeacon?.(url, new Blob([body], { type: PAGE_VIEW.CONTENT_TYPE }));
    if (!sent) void fetch(url, { method: PAGE_VIEW.METHOD, body, keepalive: true, headers: { 'Content-Type': PAGE_VIEW.CONTENT_TYPE } }).catch(() => undefined);
  }
}
