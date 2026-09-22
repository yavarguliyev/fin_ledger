import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';

import { AppConfigService } from './app-config.service';
import { GameEvent } from '../interfaces/betting/game-event.interface';

@Injectable({ providedIn: 'root' })
export class GameEventsService {
  private readonly config = inject(AppConfigService);
  private readonly http = inject(HttpClient);
  private readonly eventsSignal = signal<GameEvent[]>([]);

  readonly events = computed(() => this.eventsSignal());

  private get apiUrl (): string {
    return `${this.config.apiUrl}/game-events`;
  }

  getEvents (status?: string): Observable<GameEvent[]> {
    return this.http.get<GameEvent[]>(status ? `${this.apiUrl}?status=${status}` : this.apiUrl).pipe(
      map(events => events.map(event => ({ ...event, odds: typeof event.odds === 'string' ? parseFloat(event.odds) : event.odds }))),
      tap(events => this.eventsSignal.set(events))
    );
  }
}
