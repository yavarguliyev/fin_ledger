import { ElementRef, Injector, runInInjectionContext } from '@angular/core';

import { CountrySelectComponent } from '../../src/app/shared/components/country-select/country-select.component';
import { DatePickerComponent } from '../../src/app/shared/components/date-picker/date-picker.component';
import { MessageThreadComponent } from '../../src/app/features/support/components/message-thread.component';
import { PICKER_ESCAPE_TEST as T } from '../constants/picker-escape.constant';

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

  it('gives focus back to the field after a day is picked or Escape is pressed, so keyboard users are not dropped on the page', () => {
    const picker = create();
    const focus = jest.fn();
    Object.defineProperty(picker, 'trigger', { value: () => ({ nativeElement: { focus } }) });

    picker.toggle();
    picker.select(picker.focused());
    picker.toggle();
    picker.onEscape();

    expect(focus).toHaveBeenCalledTimes(2);
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

describe('Reaction picker closing', () => {
  it('closes the reaction picker and the full emoji panel on Escape', () => {
    const thread = runInInjectionContext(injector(), () => new MessageThreadComponent());
    thread.pickerFor.set(T.MESSAGE_ID);
    thread.expandedFor.set(T.MESSAGE_ID);

    thread.closePicker();

    expect(thread.pickerFor()).toBeNull();
    expect(thread.expandedFor()).toBeNull();
  });
});
