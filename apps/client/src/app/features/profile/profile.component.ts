import { Component, DestroyRef, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { AuthService } from '../../core/services/auth.service';
import { PROFILE } from '../../core/constants/profile/profile.constant';
import { ProfileFields } from '../../core/types/auth/profile-fields.type';
import { ThemeService } from '../../core/services/theme.service';
import { UserService } from '../../core/services/user.service';
import { ProfileImageService } from '../../core/services/profile-image.service';
import { ProfileFormService } from './services/profile-form.service';
import { ShowMoreComponent } from '../../shared/components/show-more/show-more.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { PaymentMethodsComponent } from './payment-methods/payment-methods.component';
import { TwoFactorSettingsComponent } from './two-factor/two-factor-settings.component';
import { AccountSecurityComponent } from './security/account-security.component';
import { PasskeySettingsComponent } from './passkeys/passkey-settings.component';
import { ShowMoreConfig } from '../../core/interfaces/ui/show-more-config.interface';
import { EmailHelper } from '../../core/helpers/auth/email.helper';
import { DateHelper } from '../../core/helpers/common/date.helper';
import { ValidatorsHelper } from '../../core/helpers/forms/validators.helper';
import { ProfileFormHelper } from './helpers/profile-form.helper';
import { ProfileSaveService } from './services/profile-save.service';
import { FieldErrorComponent } from '../../shared/components/field-error/field-error.component';
import { ROLES } from '../../core/constants/auth/roles.constant';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ShowMoreComponent,
    PaymentMethodsComponent,
    PageHeaderComponent,
    TwoFactorSettingsComponent,
    PasskeySettingsComponent,
    AccountSecurityComponent,
    FieldErrorComponent
  ],
  providers: [ProfileFormService, ProfileSaveService],
  templateUrl: './templates/profile.component.html'
})
export class ProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly userService = inject(UserService);
  private readonly theme = inject(ThemeService);
  readonly formService = inject(ProfileFormService);
  private readonly saveService = inject(ProfileSaveService);

  readonly imageService = inject(ProfileImageService);
  readonly createdAt = computed(() => this.auth.currentUser()?.createdAt ?? null);
  readonly isSaving = this.saveService.isSaving;
  readonly isDark = computed(() => this.theme.isDark());
  readonly isFormChanged = computed(() => this.formService.isFormChanged());

  readonly isSaveDisabled = computed(() => this.profileForm.invalid || !this.isFormChanged() || this.isSaving());
  readonly userName = computed(() => this.auth.currentUser()?.displayName ?? 'User');
  readonly email = computed(() => this.auth.currentUser()?.email ?? '');
  readonly role = computed(() => this.auth.currentUser()?.role ?? ROLES.USER);
  readonly canManagePayments = this.auth.isPlayer;
  readonly maskedEmail = computed(() => EmailHelper.maskEmail(this.email()));
  readonly memberSince = computed(() => DateHelper.formatDate(this.createdAt()));
  readonly lastLogin = computed(() => DateHelper.formatDateTime(this.auth.currentUser()?.lastLoginAt));
  readonly lastLoginIp = computed(() => this.auth.currentUser()?.lastLoginIp ?? null);
  readonly kycStatus = computed(() => this.auth.currentUser()?.kycStatus ?? null);
  readonly identityLocked = computed(() => this.kycStatus() === PROFILE.KYC_APPROVED);
  readonly visibleImages = computed(() => this.formService.getVisibleImages(this.imageService.imageUrls()));
  readonly showMoreConfig = computed<ShowMoreConfig>(() => this.formService.getShowMoreConfig(this.imageService.imageUrls().length));

  readonly profileForm = this.fb.group({
    displayName: this.fb.nonNullable.control(this.auth.currentUser()?.displayName ?? '', {
      validators: [ValidatorsHelper.createRequiredValidator(), ValidatorsHelper.createMinLengthValidator(3)]
    }),
    countryCode: this.fb.nonNullable.control({ value: this.auth.currentUser()?.countryCode ?? '', disabled: this.identityLocked() }),
    dateOfBirth: this.fb.nonNullable.control({ value: this.auth.currentUser()?.dateOfBirth ?? '', disabled: this.identityLocked() })
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
    const files = Array.from(input.files ?? []);
    if (files.length === 0) return;
    this.imageService.uploadImages(files);
    input.value = '';
  }

  ngOnInit (): void {
    this.formService.setInitialValues(this.currentProfileFields());

    this.userService.getCurrentUser().subscribe({
      next: () => this.syncFormWithUser(),
      error: () => undefined
    });

    ProfileFormHelper.watchFormChanges({ profileForm: this.profileForm, formService: this.formService, destroyRef: this.destroyRef });

    this.imageService.loadImageUrls();
    this.formService.resetImagesPage();
  }

  saveProfile (): void {
    this.saveService.save({ form: this.profileForm });
  }

  private currentProfileFields (): ProfileFields {
    const user = this.auth.currentUser();
    return { displayName: user?.displayName ?? '', countryCode: user?.countryCode ?? '', dateOfBirth: user?.dateOfBirth ?? '' };
  }

  private syncFormWithUser (): void {
    const fields = this.currentProfileFields();

    this.profileForm.patchValue(fields, { emitEvent: false });
    this.formService.setInitialValues(fields);

    if (this.identityLocked()) {
      this.profileForm.controls.countryCode.disable({ emitEvent: false });
      this.profileForm.controls.dateOfBirth.disable({ emitEvent: false });
    }
  }
}
