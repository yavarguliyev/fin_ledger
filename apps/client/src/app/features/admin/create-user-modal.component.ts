import { Component, ChangeDetectionStrategy, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ValidatorsHelper } from '../../core/helpers/forms/validators.helper';
import { ROLES } from '../../core/constants/auth/roles.constant';
import { ButtonComponent } from '../../shared/components/button/button.component';

@Component({
  selector: 'app-create-user-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, CommonModule, ReactiveFormsModule],
  templateUrl: './templates/create-user-modal.component.html'
})
export class CreateUserModalComponent {
  private readonly fb = inject(FormBuilder);

  readonly close = output<void>();
  readonly save = output<{ displayName: string; email: string; role: string }>();
  readonly loading = signal(false);

  readonly roleOptions = [
    { value: ROLES.ADMIN, label: 'Admin' },
    { value: ROLES.MODERATOR, label: 'Moderator' }
  ];

  readonly form = this.fb.group({
    displayName: this.fb.nonNullable.control('', {
      validators: [ValidatorsHelper.createRequiredValidator(), ValidatorsHelper.createMinLengthValidator(2)]
    }),
    email: this.fb.nonNullable.control('', { validators: [ValidatorsHelper.createRequiredValidator(), ValidatorsHelper.createEmailValidator()] }),
    role: this.fb.nonNullable.control('', { validators: [ValidatorsHelper.createRequiredValidator()] })
  });

  onClose (): void {
    this.form.reset();
    this.close.emit();
  }

  resetForm (): void {
    this.loading.set(false);
    this.form.reset();
  }

  onSubmit (): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const { displayName, email, role } = this.form.getRawValue();
    this.save.emit({ displayName, email, role });
  }
}
