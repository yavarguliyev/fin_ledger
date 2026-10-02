import { Component, ElementRef, computed, forwardRef, inject, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { COUNTRY_SELECT } from '../../../core/constants/ui/country-select.constant';
import { CountryHelper } from '../../../core/helpers/common/country.helper';
import { CountryOptionDto } from '../../../core/dtos/ui/country-option.dto';

@Component({
  selector: 'app-country-select',
  standalone: true,
  templateUrl: './country-select.component.html',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CountrySelectComponent), multi: true }],
  host: { '(document:click)': 'onDocumentClick($event)' }
})
export class CountrySelectComponent implements ControlValueAccessor {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly options = CountryHelper.options();
  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  readonly ariaLabel = input<string>(COUNTRY_SELECT.PLACEHOLDER);

  readonly text = COUNTRY_SELECT;
  readonly value = signal('');
  readonly query = signal('');
  readonly activeIndex = signal(0);
  readonly isOpen = signal(false);
  readonly isDisabled = signal(false);

  readonly selected = computed(() => CountryHelper.find({ options: this.options, query: this.value() }));
  readonly matches = computed(() => CountryHelper.filter({ options: this.options, query: this.query() }));
  readonly activeId = computed(() => {
    const active = this.matches()[this.activeIndex()];
    return active ? COUNTRY_SELECT.OPTION_ID_PREFIX + active.code : null;
  });

  writeValue (value: string | null): void {
    this.value.set((value ?? '').toUpperCase());
  }

  registerOnChange (fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched (fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState (disabled: boolean): void {
    this.isDisabled.set(disabled);
    if (disabled) this.isOpen.set(false);
  }

  open (): void {
    if (this.isDisabled() || this.isOpen()) return;
    this.query.set('');
    this.activeIndex.set(Math.max(this.matches().findIndex(option => option.code === this.value()), 0));
    this.isOpen.set(true);
  }

  close (): void {
    if (!this.isOpen()) return;
    this.isOpen.set(false);
    this.query.set('');
    this.onTouched();
  }

  onInput (event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.activeIndex.set(0);
    this.isOpen.set(true);
  }

  onKeydown (event: KeyboardEvent): void {
    const { KEYS } = COUNTRY_SELECT;
    const last = this.matches().length - 1;

    if (event.key === KEYS.DOWN && !this.isOpen()) this.open();
    else if (event.key === KEYS.DOWN) this.highlight(Math.min(this.activeIndex() + 1, last));
    else if (event.key === KEYS.UP) this.highlight(Math.max(this.activeIndex() - 1, 0));
    else if (event.key === KEYS.ENTER && this.isOpen()) this.choose(this.matches()[this.activeIndex()]);
    else if (event.key === KEYS.ESCAPE) this.close();
    else return;

    event.preventDefault();
  }

  choose (option: CountryOptionDto | undefined): void {
    if (!option) return;
    this.value.set(option.code);
    this.onChange(option.code);
    this.close();
  }

  optionClass (index: number): string {
    const { BASE, ACTIVE, IDLE } = COUNTRY_SELECT.OPTION_CLASSES;
    return [BASE, index === this.activeIndex() ? ACTIVE : IDLE].join(COUNTRY_SELECT.CLASS_SEPARATOR);
  }

  onDocumentClick (event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) this.close();
  }

  private highlight (index: number): void {
    this.activeIndex.set(index);
    const id = this.activeId();
    if (id) this.host.nativeElement.querySelector(`#${id}`)?.scrollIntoView({ block: COUNTRY_SELECT.SCROLL_BLOCK });
  }
}
