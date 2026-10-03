import { Component, ChangeDetectionStrategy, ElementRef, computed, forwardRef, inject, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { DATE_PICKER } from '../../../core/constants/ui/date-picker.constant';
import { CalendarHelper } from '../../../core/helpers/common/calendar.helper';
import { CalendarShiftDto } from '../../../core/interfaces/ui/calendar-shift.interface';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './date-picker.component.html',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DatePickerComponent), multi: true }],
  host: { '(document:click)': 'onDocumentClick($event)', '(document:keydown.escape)': 'onEscape()' }
})
export class DatePickerComponent implements ControlValueAccessor {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  readonly min = input<string>('');
  readonly max = input<string>('');
  readonly placeholder = input<string>(DATE_PICKER.PLACEHOLDER);
  readonly ariaLabel = input<string>(DATE_PICKER.PLACEHOLDER);

  readonly text = DATE_PICKER;
  readonly weekdays = DATE_PICKER.WEEKDAYS;
  readonly monthNames = CalendarHelper.monthNames();
  readonly value = signal('');
  readonly focused = signal('');
  readonly isOpen = signal(false);
  readonly isDisabled = signal(false);

  readonly display = computed(() => CalendarHelper.label({ iso: this.value() }));
  readonly years = computed(() => CalendarHelper.years({ min: this.min(), max: this.max() }));
  readonly view = computed(() => CalendarHelper.parse({ iso: this.focused() }));
  readonly cells = computed(() => {
    const view = this.view();
    return view ? CalendarHelper.monthGrid({ year: view.year, month: view.month }) : [];
  });

  writeValue (value: string | null): void {
    this.value.set(value ?? '');
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

  toggle (): void {
    if (this.isDisabled()) return;
    if (this.isOpen()) return this.close();

    const start = this.value() || this.max() || CalendarHelper.yearsAgo({ today: new Date(), years: 0 });
    this.focused.set(CalendarHelper.clamp({ iso: start, min: this.min(), max: this.max() }));
    this.isOpen.set(true);
  }

  close (): void {
    this.isOpen.set(false);
    this.onTouched();
  }

  select (iso: string | null): void {
    if (!iso || !this.isSelectable(iso)) return;
    this.value.set(iso);
    this.onChange(iso);
    this.close();
  }

  moveMonths (months: number): void {
    this.moveTo(CalendarHelper.shift({ iso: this.focused(), months }));
  }

  pickMonth (event: Event): void {
    const month = Number((event.target as HTMLSelectElement).value);
    this.moveMonths(month - (this.view()?.month ?? month));
  }

  pickYear (event: Event): void {
    const year = Number((event.target as HTMLSelectElement).value);
    this.moveMonths((year - (this.view()?.year ?? year)) * DATE_PICKER.MONTHS_IN_YEAR);
  }

  onGridKeydown (event: KeyboardEvent): void {
    const { KEYS, STEPS } = DATE_PICKER;
    const step = STEPS[event.key as keyof typeof STEPS] as Omit<CalendarShiftDto, 'iso'> | undefined;

    if (step) this.moveTo(CalendarHelper.shift({ iso: this.focused(), ...step }));
    else if (event.key === KEYS.ENTER || event.key === KEYS.SPACE) this.select(this.focused());
    else if (event.key === KEYS.ESCAPE) this.close();
    else return;

    event.preventDefault();
  }

  onEscape (): void {
    if (this.isOpen()) this.close();
  }

  onDocumentClick (event: MouseEvent): void {
    if (this.isOpen() && !this.host.nativeElement.contains(event.target as Node)) this.close();
  }

  isSelectable (iso: string): boolean {
    return CalendarHelper.isWithin({ iso, min: this.min(), max: this.max() });
  }

  dayClass (iso: string): string {
    const { BASE, SELECTED, IDLE, FOCUSED } = DATE_PICKER.DAY_CLASSES;
    return [BASE, iso === this.value() ? SELECTED : IDLE, ...(iso === this.focused() ? [FOCUSED] : [])].join(DATE_PICKER.CLASS_SEPARATOR);
  }

  dayOf (iso: string): number {
    return CalendarHelper.parse({ iso })?.day ?? 0;
  }

  private moveTo (iso: string): void {
    this.focused.set(CalendarHelper.clamp({ iso, min: this.min(), max: this.max() }));
  }
}
