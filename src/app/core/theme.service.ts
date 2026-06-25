import { Injectable, signal } from '@angular/core';

type Theme = 'light' | 'dark';
const KEY = 'zlink_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<Theme>(this.initial());

  private initial(): Theme {
    const saved = localStorage.getItem(KEY) as Theme | null;
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  apply(): void {
    document.documentElement.setAttribute('data-theme', this.theme());
  }

  toggle(): void {
    this.theme.update((t) => (t === 'dark' ? 'light' : 'dark'));
    localStorage.setItem(KEY, this.theme());
    this.apply();
  }
}
