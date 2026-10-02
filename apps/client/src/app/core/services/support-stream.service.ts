import { DestroyRef, Injectable, NgZone, inject } from '@angular/core';

import { SUPPORT } from '../constants/support/support.constant';
import { SupportApiService } from './support-api.service';
import { SupportStreamEvent } from '../interfaces/support/support-stream-event.interface';
import { SupportStreamHandlerDto } from '../interfaces/support/support-stream-handler.interface';
import { AttachSupportStreamDto } from '../interfaces/support/attach-support-stream.interface';

@Injectable({ providedIn: 'root' })
export class SupportStreamService {
  private readonly api = inject(SupportApiService);
  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);

  private source: EventSource | null = null;
  private attempt = 0;
  private stopped = false;
  private hasOpened = false;
  private timer: ReturnType<typeof setTimeout> | null = null;

  connect ({ onMessage, onReconnect }: SupportStreamHandlerDto): void {
    if (this.source) return;

    this.stopped = false;
    this.attempt = 0;
    this.hasOpened = false;
    this.destroyRef.onDestroy(() => this.disconnect());
    this.open({ onMessage, ...(onReconnect && { onReconnect }) });
  }

  disconnect (): void {
    this.stopped = true;
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.source?.close();
    this.source = null;
  }

  private open ({ onMessage, onReconnect }: SupportStreamHandlerDto): void {
    const handler = { onMessage, ...(onReconnect && { onReconnect }) };
    this.api.streamTicket().subscribe({
      next: ({ ticket }) => this.attach({ ...handler, ticket }),
      error: () => this.scheduleReconnect(handler)
    });
  }

  private scheduleReconnect ({ onMessage, onReconnect }: SupportStreamHandlerDto): void {
    const handler = { onMessage, ...(onReconnect && { onReconnect }) };
    if (this.stopped) return;
    const delay = Math.min(SUPPORT.RECONNECT_BASE_MS * 2 ** this.attempt, SUPPORT.RECONNECT_MAX_MS);
    this.attempt += 1;
    this.timer = setTimeout(() => this.open(handler), delay);
  }

  private attach ({ ticket, onMessage, onReconnect }: AttachSupportStreamDto): void {
    if (this.stopped) return;
    this.source = new EventSource(this.api.streamUrl({ ticket }));

    this.source.onopen = (): void => {
      this.attempt = 0;
      if (this.hasOpened && onReconnect) this.zone.run(() => onReconnect());
      this.hasOpened = true;
    };

    this.source.onmessage = (event: MessageEvent): void => {
      this.zone.run(() => onMessage(JSON.parse(event.data as string) as SupportStreamEvent));
    };

    this.source.onerror = (): void => {
      this.source?.close();
      this.source = null;
      this.scheduleReconnect({ onMessage, ...(onReconnect && { onReconnect }) });
    };
  }
}
