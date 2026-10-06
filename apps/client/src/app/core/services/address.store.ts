import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, debounceTime, distinctUntilChanged, filter, of, switchMap } from 'rxjs';

import { ADDRESS } from '../constants/address/address.constant';
import { ADDRESS_MESSAGES } from '../constants/address/address-messages.constant';
import { AddressApiService } from './address-api.service';
import { AddressPayload } from '../interfaces/address/address-payload.interface';
import { GeocodedAddress } from '../interfaces/address/geocoded-address.interface';
import { GeolocationHelper } from '../helpers/address/geolocation.helper';
import { LatLngDto } from '../interfaces/address/lat-lng.interface';
import { LocatedAddressDto } from '../interfaces/address/located-address.interface';
import { PositionLookupDto } from '../interfaces/address/position-lookup.interface';
import { SavedAddress } from '../interfaces/address/saved-address.interface';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class AddressStore {
  private readonly api = inject(AddressApiService);
  private readonly toast = inject(ToastService);
  private readonly queries = new Subject<string>();

  readonly saved = signal<SavedAddress | null>(null);
  readonly suggestions = signal<GeocodedAddress[]>([]);
  readonly located = signal<LocatedAddressDto | null>(null);
  readonly pin = signal<LatLngDto | null>(null);
  readonly locating = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  constructor () {
    this.queries
      .pipe(
        debounceTime(ADDRESS.DEBOUNCE_MS),
        distinctUntilChanged(),
        filter(q => q.trim().length >= ADDRESS.MIN_QUERY),
        switchMap(q => this.api.search({ q }).pipe(catchError(() => of(null)))),
        takeUntilDestroyed(inject(DestroyRef))
      )
      .subscribe(results => {
        this.suggestions.set(results ?? []);
        this.error.set(results ? null : ADDRESS_MESSAGES.LOOKUP_FAILED);
      });
  }

  load (): void {
    this.api.get().subscribe({
      next: address => {
        this.saved.set(address);
        if (address?.latitude != null && address.longitude != null) this.pin.set({ latitude: address.latitude, longitude: address.longitude });
      },
      error: () => undefined
    });
  }

  query (q: string): void {
    if (q.trim().length < ADDRESS.MIN_QUERY) this.suggestions.set([]);
    this.queries.next(q);
  }

  choose (address: GeocodedAddress): void {
    this.suggestions.set([]);
    this.pin.set({ latitude: address.latitude, longitude: address.longitude });
    this.located.set({ address, source: ADDRESS.SOURCES.MANUAL });
  }

  async locate (): Promise<void> {
    this.error.set(null);
    this.locating.set(true);
    try {
      const position = await GeolocationHelper.current();
      this.lookup({ position, source: ADDRESS.SOURCES.CURRENT_LOCATION });
    } catch (error) {
      this.locating.set(false);
      this.error.set(error instanceof Error ? error.message : ADDRESS_MESSAGES.UNSUPPORTED);
    }
  }

  dropPin (position: LatLngDto): void {
    this.error.set(null);
    this.locating.set(true);
    this.lookup({ position, source: ADDRESS.SOURCES.MAP });
  }

  save (payload: AddressPayload): void {
    this.saving.set(true);
    this.api.save(payload).subscribe({
      next: address => {
        this.saving.set(false);
        this.saved.set(address);
        this.toast.success(ADDRESS_MESSAGES.SAVED);
      },
      error: () => {
        this.saving.set(false);
        this.toast.error(ADDRESS_MESSAGES.SAVE_FAILED);
      }
    });
  }

  remove (): void {
    this.api.remove().subscribe({
      next: () => {
        this.saved.set(null);
        this.pin.set(null);
        this.toast.success(ADDRESS_MESSAGES.REMOVED);
      },
      error: () => undefined
    });
  }

  private lookup ({ position, source }: PositionLookupDto): void {
    this.pin.set(position);
    this.api.reverse(position).subscribe({
      next: ([address]) => {
        this.locating.set(false);
        this.located.set({ address: address ?? GeolocationHelper.blankAt(position), source });
      },
      error: () => {
        this.locating.set(false);
        this.error.set(ADDRESS_MESSAGES.LOOKUP_FAILED);
      }
    });
  }
}
