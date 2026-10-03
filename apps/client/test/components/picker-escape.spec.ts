import { ElementRef, Injector, runInInjectionContext } from '@angular/core';

import { DatePickerComponent } from '../../src/app/shared/components/date-picker/date-picker.component';

const create = (): DatePickerComponent =>
  runInInjectionContext(Injector.create({ providers: [{ provide: ElementRef, useValue: { nativeElement: { contains: (): boolean => false } } }] }), () => new DatePickerComponent());

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
