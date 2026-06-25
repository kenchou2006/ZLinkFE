import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
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

  readonly user = this.auth.user;
  readonly theme = this.themeSvc.theme;

  // Top-level items.
  private topItems: NavItem[] = [
    { label: 'Links', icon: 'link', path: '/links' },
    { label: 'Profile', icon: 'person', path: '/settings/profile' },
  ];

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

  toggleTheme(): void {
    this.themeSvc.toggle();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
