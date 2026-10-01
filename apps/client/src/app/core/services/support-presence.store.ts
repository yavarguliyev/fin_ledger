import { Injectable, computed, inject, signal } from '@angular/core';

import { PresenceEntry } from '../types/support/presence-entry.type';
import { PresenceHelper } from '../helpers/support/presence.helper';
import { PresenceRefDto } from '../dtos/support/presence-ref.dto';
import { StreamEventRefDto } from '../dtos/support/stream-event-ref.dto';
import { SUPPORT } from '../constants/support/support.constant';
import { SupportApiService } from './support-api.service';
import { UserIdRefDto } from '../dtos/support/user-id-ref.dto';

@Injectable({ providedIn: 'root' })
export class SupportPresenceStore {
  private readonly api = inject(SupportApiService);
  private readonly entriesSignal = signal<PresenceEntry[]>([]);
  private readonly contactsSignal = signal<PresenceEntry[]>([]);
  private readonly lastSeenSignal = signal<Record<string, PresenceEntry>>({});

  readonly entries = computed(() => this.entriesSignal());
  readonly contacts = computed(() => this.contactsSignal());

  heartbeat (): void {
    this.api.heartbeat().subscribe({ error: () => undefined });
  }

  reset (): void {
    this.entriesSignal.set([]);
    this.contactsSignal.set([]);
    this.lastSeenSignal.set({});
  }

  load (): void {
    this.api.listPresence().subscribe({ next: entries => this.entriesSignal.set(entries), error: () => undefined });
  }

  loadContacts (): void {
    this.api.listContacts().subscribe({ next: contacts => this.contactsSignal.set(contacts), error: () => undefined });
  }

  track ({ userId }: UserIdRefDto): void {
    if (!userId) return;

    this.api.lastSeen({ userId }).subscribe({
      next: ({ lastSeenAt }) => this.remember({ presence: { userId, displayName: '', role: '', state: SUPPORT.OFFLINE_STATE, lastSeenAt } }),
      error: () => undefined
    });
  }

  find ({ userId }: UserIdRefDto): PresenceEntry | null {
    const online = this.entriesSignal().find(entry => entry.userId === userId);
    const contact = this.contactsSignal().find(entry => entry.userId === userId);
    return online ?? contact ?? this.lastSeenSignal()[userId] ?? null;
  }

  applyEvent ({ event }: StreamEventRefDto): void {
    if (event.presence) this.apply({ presence: event.presence });
  }

  private apply ({ presence }: PresenceRefDto): void {
    this.entriesSignal.set(PresenceHelper.upsertOnline({ current: this.entriesSignal(), presence }));
    this.contactsSignal.set(PresenceHelper.replace({ current: this.contactsSignal(), presence }));
    this.remember({ presence });
  }

  private remember ({ presence }: PresenceRefDto): void {
    this.lastSeenSignal.set({ ...this.lastSeenSignal(), [presence.userId]: presence });
  }
}
