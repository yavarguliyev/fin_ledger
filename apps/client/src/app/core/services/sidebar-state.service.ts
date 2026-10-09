import { Injectable, signal } from '@angular/core';

import { SIDEBAR } from '../constants/ui/sidebar.constant';

@Injectable({ providedIn: 'root' })
export class SidebarStateService {
  private readonly collapsedSignal = signal(this.read());

  readonly collapsed = this.collapsedSignal.asReadonly();
  readonly labels = SIDEBAR;

  toggle (): void {
    const next = !this.collapsedSignal();
    this.collapsedSignal.set(next);
    try {
      if (next) localStorage.setItem(SIDEBAR.STORAGE_KEY, SIDEBAR.COLLAPSED_VALUE);
      else localStorage.removeItem(SIDEBAR.STORAGE_KEY);
    } catch {
      return;
    }
  }

  private read (): boolean {
    try {
      return localStorage.getItem(SIDEBAR.STORAGE_KEY) === SIDEBAR.COLLAPSED_VALUE;
    } catch {
      return false;
    }
  }
}
