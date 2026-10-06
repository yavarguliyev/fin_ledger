import { Component, ChangeDetectionStrategy, computed, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { FIELD } from '../../../core/constants/ui/field.constant';
import { UiPrimitiveHelper } from '../../../core/helpers/ui/ui-primitive.helper';
import { SelectOptionDto } from '../../../core/interfaces/ui/select-option.interface';

@Component({
  selector: 'app-select-field',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './select-field.component.html',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SelectFieldComponent), multi: true }]
})
export class SelectFieldComponent implements ControlValueAccessor {
  readonly options = input.required<SelectOptionDto[]>();
  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  readonly label = input.required<string>();
  readonly fieldId = input.required<string>();
  readonly error = input<string | null>(null);

  readonly styles = FIELD;
  readonly value = signal<string>(FIELD.EMPTY);
  readonly isDisabled = signal(false);
  readonly classes = computed(() => UiPrimitiveHelper.field({ invalid: this.error() !== null }));
  readonly errorId = computed(() => this.fieldId() + FIELD.ERROR_SUFFIX);

  writeValue (value: string | null): void {
    this.value.set(value ?? FIELD.EMPTY);
  }

  registerOnChange (fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched (fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState (disabled: boolean): void {
    this.isDisabled.set(disabled);
  }

  update (event: Event): void {
    const value = (event.target as HTMLInputElement | HTMLSelectElement).value;
    this.value.set(value);
    this.onChange(value);
  }

  touch (): void {
    this.onTouched();
  }
}
