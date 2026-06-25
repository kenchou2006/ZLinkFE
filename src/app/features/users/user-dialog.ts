import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { UsersService } from '../../core/api/users.service';
import { AuthService } from '../../core/auth.service';
import { User } from '../../core/models';
import { apiError } from '../../shared/api-error';

@Component({
  selector: 'app-user-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
  ],
  templateUrl: './user-dialog.html',
})
export class UserDialog {
  private fb = inject(FormBuilder);
  private users = inject(UsersService);
  private auth = inject(AuthService);
  private ref = inject(MatDialogRef<UserDialog>);
  data = inject<User | null>(MAT_DIALOG_DATA);

  saving = signal(false);
  error = signal<string | null>(null);
  isEdit = !!this.data;
  isSelf = this.data?.id === this.auth.user()?.id;

  form = this.fb.nonNullable.group({
    username: [this.data?.username ?? '', Validators.required],
    email: [this.data?.email ?? ''],
    password: [''],
    confirm_password: [''],
    is_superuser: [this.data?.is_superuser ?? false],
  });

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.error.set(null);
    const v = this.form.getRawValue();

    if (this.isEdit) {
      const payload: Record<string, unknown> = {
        username: v.username,
        email: v.email,
      };
      if (v.password) {
        payload['password'] = v.password;
        payload['confirm_password'] = v.confirm_password;
      }
      // Only send the superuser flag when allowed (superuser editing others).
      if (this.auth.isSuperuser() && !this.isSelf) {
        payload['is_superuser'] = v.is_superuser;
      }
      this.users.update(this.data!.id, payload).subscribe({
        next: (u) => this.ref.close(u),
        error: (e) => this.fail(e),
      });
    } else {
      this.users
        .create({
          username: v.username,
          email: v.email,
          password: v.password,
          confirm_password: v.confirm_password,
        })
        .subscribe({
          next: (u) => this.ref.close(u),
          error: (e) => this.fail(e),
        });
    }
  }

  private fail(e: unknown): void {
    this.saving.set(false);
    this.error.set(apiError(e, 'Could not save user.'));
  }

  get canEditSuperuser(): boolean {
    return this.auth.isSuperuser() && !this.isSelf;
  }
}
