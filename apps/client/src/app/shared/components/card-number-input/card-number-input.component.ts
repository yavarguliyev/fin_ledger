import { Component, input, output, signal, computed, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

import { CardBrand } from '../../../core/models/base.model';
import { getMaxCardLength } from '@/core/helpers/get-max-card-length.helper';
import { formatCardNumber } from '@/core/helpers/format-card-number.helper';
import { detectCardBrand } from '@/core/helpers/detect-card-brand.helper';
import { validateLuhn } from '@/core/helpers/validate-luhn.helper';

@Component({
  selector: 'app-card-number-input',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CardNumberInputComponent),
      multi: true
    }
  ],
  templateUrl: './templates/card-number-input.component.html'
})
export class CardNumberInputComponent implements ControlValueAccessor {
  readonly placeholder = input('0000 0000 0000 0000');
  readonly disabled = input(false);
  readonly brandChange = output<CardBrand>();
  readonly validChange = output<boolean>();

  readonly rawValue = signal('');
  readonly displayValue = signal('');
  readonly brand = computed<CardBrand>(() => detectCardBrand(this.rawValue()));
  readonly isLuhnValid = computed(() => validateLuhn(this.rawValue()));

  private onChange: (val: string) => void = () => {};
  private onTouched: () => void = () => {};

  onInput (event: Event): void {
    if (!(event.target instanceof HTMLInputElement)) return;
    const target = event.target;
    const digitsOnly = target.value.replace(/\D/g, '');
    const maxLen = getMaxCardLength(this.brand());
    const trimmed = digitsOnly.substring(0, maxLen);

    this.rawValue.set(trimmed);

    const formatted = formatCardNumber(trimmed);
    this.displayValue.set(formatted);
    target.value = formatted;

    this.onChange(trimmed);
    this.brandChange.emit(this.brand());
    this.validChange.emit(this.isLuhnValid());
  }

  onBlur (): void {
    this.onTouched();
  }

  writeValue (value: string): void {
    const clean = (value || '').replace(/\D/g, '');
    this.rawValue.set(clean);
    this.displayValue.set(formatCardNumber(clean));
  }

  registerOnChange (fn: (val: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched (fn: () => void): void {
    this.onTouched = fn;
  }
}
