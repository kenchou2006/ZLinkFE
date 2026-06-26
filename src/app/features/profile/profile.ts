import { TranslatePipe } from '@ngx-translate/core';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ProfileService } from '../../core/api/profile.service';
import { AuthService } from '../../core/auth.service';
import { apiError } from '../../shared/api-error';

@Component({
  selector: 'app-profile',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    TranslatePipe,
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  private fb = inject(FormBuilder);
  private profile = inject(ProfileService);
  private auth = inject(AuthService);
  private snack = inject(MatSnackBar);
  private router = inject(Router);

  saving = signal(false);

  form = this.fb.nonNullable.group({
    username: [''],
    email: [''],
    avatar_url: [''],
    current_password: [''],
    new_password: [''],
    confirm_password: [''],
  });

  ngOnInit(): void {
    const u = this.auth.user();
    if (u) {
      this.form.patchValue({
        username: u.username,
        email: u.email,
        avatar_url: u.avatar_url ?? '',
      });
    }
  }

  save(): void {
    this.saving.set(true);
    const payload = this.form.getRawValue();
    this.profile.update(payload).subscribe({
      next: (res) => {
        this.saving.set(false);
        this.auth.user.set(res.user);
        if (res.password_changed) {
          this.snack.open('Password changed. Please sign in again.', undefined, { duration: 3000 });
          this.auth.clear();
          this.router.navigate(['/login']);
        } else {
          this.snack.open('Profile updated.', undefined, { duration: 2000 });
          this.form.patchValue({ current_password: '', new_password: '', confirm_password: '' });
        }
      },
      error: (e) => {
        this.saving.set(false);
        this.snack.open(apiError(e, 'Could not update profile.'), 'Dismiss', { duration: 4000 });
      },
    });
  }
}
