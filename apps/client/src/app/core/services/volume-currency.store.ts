import { Injectable, signal } from '@angular/core';

import { VOLUME_CURRENCY } from '../constants/admin/volume-currency.constant';

@Injectable({ providedIn: 'root' })
export class VolumeCurrencyStore {
  readonly selected = signal<string | null>(VolumeCurrencyStore.stored());

  choose (currency: string): void {
    this.selected.set(currency);
    try {
      localStorage.setItem(VOLUME_CURRENCY.STORAGE_KEY, currency);
    } catch {
      return;
    }
  }

  private static stored (): string | null {
    try {
      return localStorage.getItem(VOLUME_CURRENCY.STORAGE_KEY);
    } catch {
      return null;
    }
  }
}
