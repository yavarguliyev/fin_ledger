import { ElementRef, Injector, runInInjectionContext } from '@angular/core';

import { CountrySelectComponent } from '../../src/app/shared/components/country-select/country-select.component';
import { DatePickerComponent } from '../../src/app/shared/components/date-picker/date-picker.component';

const injector = (): Injector => Injector.create({ providers: [{ provide: ElementRef, useValue: { nativeElement: { contains: (): boolean => false } } }] });

const create = (): DatePickerComponent => runInInjectionContext(injector(), () => new DatePickerComponent());

describe('Date picker closing', () => {
  it('closes on Escape wherever focus is, not only inside the day grid', () => {
    const picker = create();
    picker.toggle();
    expect(picker.isOpen()).toBe(true);

    picker.onEscape();
    expect(picker.isOpen()).toBe(false);
  });

  it('ignores Escape while it is closed', () => {
    const picker = create();

    picker.onEscape();
    expect(picker.isOpen()).toBe(false);
  });
});

describe('Country select closing', () => {
  it('closes on Escape after the list was opened', () => {
    const select = runInInjectionContext(injector(), () => new CountrySelectComponent());
    select.open();
    expect(select.isOpen()).toBe(true);

    select.onEscape();
    expect(select.isOpen()).toBe(false);
  });
});
