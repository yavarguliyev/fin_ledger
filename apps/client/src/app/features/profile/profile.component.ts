import { Component, inject, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { ToastService } from '../../core/services/toast.service';
import { UserService } from '../../core/services/user.service';
import { ProfileImageService } from '../../core/services/profile-image.service';
import { ProfileFormService } from './services/profile-form.service';
import { ShowMoreComponent } from '../../shared/components/show-more/show-more.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { PaymentMethodsComponent } from './payment-methods/payment-methods.component';
import { ShowMoreConfig } from '../../core/models/base.mode';
import { maskEmail } from '../../core/utils/mask-email.util';
import { DateUtil } from '../../core/utils/date.util';
import { createRequiredValidator, createMinLengthValidator } from '../../core/utils/validators.util';
import { watchFormChanges, handleProfileSave } from './helpers/profile-form.helper';
import { loadWalletData, handleProfileUpdateSuccess } from './helpers/profile-data.helper';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ShowMoreComponent, PaymentMethodsComponent, PageHeaderComponent],
  providers: [ProfileFormService],
  templateUrl: './templates/profile.component.html'
})
export class ProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly theme = inject(ThemeService);
  private readonly toast = inject(ToastService);
  readonly formService = inject(ProfileFormService);

  readonly imageService = inject(ProfileImageService);
  readonly currency = signal('USD');
  readonly createdAt = signal('');
  readonly isSaving = signal(false);
  readonly isDark = computed(() => this.theme.isDark());
  readonly isFormChanged = computed(() => this.formService.isFormChanged());
  readonly supportedCurrencies = ['USD', 'EUR', 'GBP'] as const;

  readonly isSaveDisabled = computed(() => this.profileForm.invalid || !this.isFormChanged() || this.isSaving());
  readonly userName = computed(() => this.auth.currentUser()?.displayName ?? 'User');
  readonly email = computed(() => this.auth.currentUser()?.email ?? '');
  readonly role = computed(() => this.auth.currentUser()?.role ?? 'user');
  readonly isUser = computed(() => this.auth.currentUser()?.role === 'user');
  readonly canManagePayments = computed(() => this.auth.currentUser()?.role === 'user');
  readonly maskedEmail = computed(() => maskEmail(this.email()));
  readonly memberSince = computed(() => DateUtil.formatDate(this.createdAt()));
  readonly visibleImages = computed(() => this.formService.getVisibleImages(this.imageService.imageUrls()));
  readonly showMoreConfig = computed<ShowMoreConfig>(() => this.formService.getShowMoreConfig(this.imageService.imageUrls().length));

  readonly profileForm = this.fb.group({
    displayName: this.fb.nonNullable.control(this.auth.currentUser()?.displayName ?? '', {
      validators: [createRequiredValidator(), createMinLengthValidator(3)]
    }),
    currency: this.fb.nonNullable.control('USD')
  });

  initial (): string {
    return this.userName().charAt(0).toUpperCase();
  }

  toggleTheme (): void {
    this.theme.toggle();
  }

  loadMoreImages (): void {
    this.formService.loadMoreImages();
  }

  deleteAllImages (): void {
    this.imageService.deleteAllImages();
  }

  onImageError (event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }

  onFileSelected (event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const files = Array.from(input.files);
    this.imageService.uploadImages(files);
    input.value = '';
  }

  ngOnInit (): void {
    const initialDisplayName = this.auth.currentUser()?.displayName ?? '';
    const initialCurrency = 'USD';

    this.formService.setInitialValue(initialDisplayName, initialCurrency);

    const walletId = this.auth.currentUser()?.walletId ?? null;
    const displayName = this.profileForm.value.displayName ?? '';

    loadWalletData(walletId, displayName, this.formService, this.currency, this.createdAt, this.profileForm);
    watchFormChanges(this.profileForm, this.isUser(), this.formService);

    this.imageService.loadImageUrls();
    this.formService.resetImagesPage();
  }

  saveProfile (): void {
    if (this.profileForm.invalid || !this.isFormChanged() || this.isSaving()) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const updateData = handleProfileSave(this.profileForm, this.isUser());
    if (!updateData) return;

    this.isSaving.set(true);
    this.userService.updateProfile(updateData).subscribe({
      next: () => {
        const { displayName, currency } = this.profileForm.value;

        const availableCurrency = currency ?? this.currency();
        const walletId = this.auth.currentUser()?.walletId ?? null;

        handleProfileUpdateSuccess(displayName ?? '', availableCurrency, this.isUser(), walletId, this.formService, this.currency, this.profileForm);

        this.toast.success('Profile updated');
        this.isSaving.set(false);
      },
      error: (err: Error) => {
        this.toast.error(err.message || 'Failed to update profile');
        this.isSaving.set(false);
      }
    });
  }
}
