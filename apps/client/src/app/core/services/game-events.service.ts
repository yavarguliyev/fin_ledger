import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import { GameEvent } from '../models/wallet.model';

@Injectable({ providedIn: 'root' })
export class GameEventsService {
  private readonly apiUrl = `${environment.apiUrl}/game-events`;
  private readonly http = inject(HttpClient);
  private readonly eventsSignal = signal<GameEvent[]>([]);

  readonly events = computed(() => this.eventsSignal());

  getEvents (status?: string): Observable<GameEvent[]> {
    return this.http.get<GameEvent[]>(status ? `${this.apiUrl}?status=${status}` : this.apiUrl).pipe(
      map(events => events.map(event => ({ ...event, odds: typeof event.odds === 'string' ? parseFloat(event.odds) : event.odds }))),
      tap(events => this.eventsSignal.set(events))
    );
  }
}
