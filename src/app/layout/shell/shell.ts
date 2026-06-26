import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { ThemeService } from '../../core/theme.service';

interface NavItem {
  label: string;
  icon: string;
  path: string;
  superuserOnly?: boolean;
}

@Component({
  selector: 'app-shell',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
  ],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  private auth = inject(AuthService);
  private themeSvc = inject(ThemeService);
  private router = inject(Router);
  private breakpoints = inject(BreakpointObserver);

  readonly user = this.auth.user;
  readonly theme = this.themeSvc.theme;

  // Below tablet width the sidenav becomes an overlay drawer instead of a
  // permanent column, so it doesn't push page content off-screen.
  readonly isMobile = toSignal(
    this.breakpoints.observe(Breakpoints.Handset).pipe(map((r) => r.matches)),
    { initialValue: false },
  );

  // Top-level items. Profile lives in the top-right user menu only.
  private topItems: NavItem[] = [{ label: 'Links', icon: 'link', path: '/links' }];

  // Items grouped under the "Manage" section.
  private manageGroup: NavItem[] = [
    { label: 'API Keys', icon: 'vpn_key', path: '/settings/api-keys' },
    { label: 'Users', icon: 'group', path: '/settings/users', superuserOnly: true },
    { label: 'Cache', icon: 'memory', path: '/settings/cache', superuserOnly: true },
  ];

  readonly navItems = this.topItems;

  readonly manageItems = computed(() =>
    this.manageGroup.filter((i) => !i.superuserOnly || this.auth.isSuperuser())
  );

  // Expand "Manage" by default when the user is on one of its pages.
  readonly manageOpen = signal(this.router.url.startsWith('/settings/'));

  toggleManage(): void {
    this.manageOpen.update((v) => !v);
  }

  closeOnMobile(sidenav: MatSidenav): void {
    if (this.isMobile()) sidenav.close();
  }

  toggleTheme(): void {
    this.themeSvc.toggle();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
