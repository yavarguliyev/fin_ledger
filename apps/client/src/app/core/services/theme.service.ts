import { Injectable, signal, computed, effect } from '@angular/core';

import { Theme } from '../types/ui/theme.type';
import { THEME } from '../constants/ui/theme.constant';
import { ThemeHelper } from '../helpers/ui/theme.helper';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly themeSignal = signal<Theme>(this.readTheme());

  readonly theme = computed(() => this.themeSignal());
  readonly isDark = computed(() => this.themeSignal() === THEME.DARK);

  constructor () {
    effect(() => {
      const theme = this.themeSignal();

      if (theme === THEME.DARK) document.documentElement.classList.add(THEME.DARK_CLASS);
      else document.documentElement.classList.remove(THEME.DARK_CLASS);

      localStorage.setItem(THEME.STORAGE_KEY, theme);
    });
  }

  toggle (): void {
    this.themeSignal.update(t => (t === THEME.DARK ? THEME.LIGHT : THEME.DARK));
  }

  set (theme: Theme): void {
    this.themeSignal.set(theme);
  }

  private readTheme (): Theme {
    return ThemeHelper.initial({ stored: localStorage.getItem(THEME.STORAGE_KEY) });
  }
}
