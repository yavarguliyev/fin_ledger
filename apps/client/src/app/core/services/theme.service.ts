import { Injectable, signal, computed, effect } from '@angular/core';

import { Theme } from '../models/base.mode';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly themeSignal = signal<Theme>(this.readTheme());

  readonly theme = computed(() => this.themeSignal());
  readonly isDark = computed(() => this.themeSignal() === 'dark');

  constructor () {
    effect(() => {
      const theme = this.themeSignal();

      if (theme === 'dark') document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');

      localStorage.setItem('theme', theme);
    });
  }

  toggle (): void {
    this.themeSignal.update(t => (t === 'dark' ? 'light' : 'dark'));
  }

  set (theme: Theme): void {
    this.themeSignal.set(theme);
  }

  private readTheme (): Theme {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
