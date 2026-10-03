import { ChangeDetectionStrategy, Type } from '@angular/core';

import { App } from '../../src/app/app.component';
import { CallOverlayComponent } from '../../src/app/layout/call-overlay.component';
import { ShellComponent } from '../../src/app/layout/shell.component';
import { ToastHostComponent } from '../../src/app/layout/toast.component';
import { CountrySelectComponent } from '../../src/app/shared/components/country-select/country-select.component';
import { DataTableComponent } from '../../src/app/shared/components/data-table/data-table.component';
import { DatePickerComponent } from '../../src/app/shared/components/date-picker/date-picker.component';
import { EmptyStateComponent } from '../../src/app/shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../src/app/shared/components/error-state/error-state.component';
import { FieldErrorComponent } from '../../src/app/shared/components/field-error/field-error.component';
import { ModalComponent } from '../../src/app/shared/components/modal/modal.component';
import { OtpInputComponent } from '../../src/app/shared/components/otp-input/otp-input.component';
import { PageHeaderComponent } from '../../src/app/shared/components/page-header/page-header.component';
import { PaginationComponent } from '../../src/app/shared/components/pagination/pagination.component';
import { PasskeyButtonComponent } from '../../src/app/shared/components/passkey-button/passkey-button.component';
import { PasswordToggleComponent } from '../../src/app/shared/components/password-toggle/password-toggle.component';
import { ReceiptLinkComponent } from '../../src/app/shared/components/receipt-link/receipt-link.component';
import { ReceiptViewerComponent } from '../../src/app/shared/components/receipt-viewer/receipt-viewer.component';
import { ShowMoreComponent } from '../../src/app/shared/components/show-more/show-more.component';
import { SkeletonComponent } from '../../src/app/shared/components/skeleton/skeleton.component';
import { StatsCardComponent } from '../../src/app/shared/components/stats-card/stats-card.component';
import { ToggleComponent } from '../../src/app/shared/components/toggle/toggle.component';
import { componentMetadata } from '../fakes/component-metadata.fake';

const SHARED_COMPONENTS: Type<unknown>[] = [
  App,
  ShellComponent,
  CallOverlayComponent,
  ToastHostComponent,
  CountrySelectComponent,
  DataTableComponent,
  DatePickerComponent,
  EmptyStateComponent,
  ErrorStateComponent,
  FieldErrorComponent,
  ModalComponent,
  OtpInputComponent,
  PageHeaderComponent,
  PaginationComponent,
  PasskeyButtonComponent,
  PasswordToggleComponent,
  ReceiptLinkComponent,
  ReceiptViewerComponent,
  ShowMoreComponent,
  SkeletonComponent,
  StatsCardComponent,
  ToggleComponent
];

describe('Layout and shared components render only when their inputs or signals change', () => {
  it.each(SHARED_COMPONENTS.map(component => [component.name, component]))('%s uses OnPush change detection', (_, component) => {
    const metadata = componentMetadata({ component });

    expect(metadata?.changeDetection).toBe(ChangeDetectionStrategy.OnPush);
  });
});
