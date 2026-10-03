import { Injectable, computed, signal } from '@angular/core';

import { CONNECTIVITY } from '../constants/ui/connectivity.constant';

@Injectable({ providedIn: 'root' })
export class ConnectivityService {
  private readonly onlineSignal = signal(typeof navigator === 'undefined' ? true : navigator.onLine);

  readonly online = this.onlineSignal.asReadonly();
  readonly offline = computed(() => !this.onlineSignal());
  readonly banner = CONNECTIVITY.BANNER;

  constructor () {
    if (typeof window === 'undefined') return;
    window.addEventListener(CONNECTIVITY.ONLINE_EVENT, () => this.onlineSignal.set(true));
    window.addEventListener(CONNECTIVITY.OFFLINE_EVENT, () => this.onlineSignal.set(false));
  }
}
