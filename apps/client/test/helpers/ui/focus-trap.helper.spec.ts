import { FocusTrapHelper } from '../../../src/app/core/helpers/ui/focus-trap.helper';
import { FOCUS_TRAP_TEST as T } from '../../constants/focus-trap.constant';

describe('FocusTrapHelper', () => {
  it('wraps Tab from the last control back to the first', () => {
    expect(FocusTrapHelper.wrapTo({ count: T.COUNT, current: T.LAST, backwards: false })).toBe(T.FIRST);
  });

  it('wraps Shift+Tab from the first control to the last', () => {
    expect(FocusTrapHelper.wrapTo({ count: T.COUNT, current: T.FIRST, backwards: true })).toBe(T.LAST);
  });

  it('pulls focus back inside when it has escaped the dialog', () => {
    expect(FocusTrapHelper.wrapTo({ count: T.COUNT, current: T.OUTSIDE, backwards: false })).toBe(T.FIRST);
    expect(FocusTrapHelper.wrapTo({ count: T.COUNT, current: T.OUTSIDE, backwards: true })).toBe(T.LAST);
  });

  it('lets the browser move focus normally in the middle, and does nothing with no controls', () => {
    expect(FocusTrapHelper.wrapTo({ count: T.COUNT, current: T.MIDDLE, backwards: false })).toBeNull();
    expect(FocusTrapHelper.wrapTo({ count: 0, current: T.OUTSIDE, backwards: false })).toBeNull();
  });
});
