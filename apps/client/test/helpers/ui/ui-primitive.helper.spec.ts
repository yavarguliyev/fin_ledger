import { BUTTON } from '../../../src/app/core/constants/ui/button.constant';
import { UiPrimitiveHelper } from '../../../src/app/core/helpers/ui/ui-primitive.helper';
import { UI_PRIMITIVE_TEST as T } from '../../constants/ui-primitive.constant';

describe('UiPrimitiveHelper', () => {
  it('builds button classes per variant with a 44 px tap target', () => {
    const primary = UiPrimitiveHelper.button({ variant: BUTTON.VARIANTS.PRIMARY, fullWidth: true });
    const danger = UiPrimitiveHelper.button({ variant: BUTTON.VARIANTS.DANGER, fullWidth: false });

    expect(primary).toContain(T.PRIMARY_CLASS);
    expect(primary).toContain(T.FULL_WIDTH);
    expect(primary).toContain(T.TAP_TARGET);
    expect(danger).toContain(T.DANGER_CLASS);
    expect(danger).not.toContain(T.FULL_WIDTH);
  });

  it('marks an invalid field and colours a badge by status, with a neutral fallback', () => {
    expect(UiPrimitiveHelper.field({ invalid: true })).toContain(T.INVALID_CLASS);
    expect(UiPrimitiveHelper.field({ invalid: false })).not.toContain(T.INVALID_CLASS);
    expect(UiPrimitiveHelper.badge({ status: T.ACTIVE_STATUS })).toContain(T.ACTIVE_CLASS);
    expect(UiPrimitiveHelper.badge({ status: T.UNKNOWN_STATUS })).toContain(T.FALLBACK_CLASS);
  });

  it('moves between tabs with the arrow, Home and End keys, wrapping at both ends', () => {
    expect(UiPrimitiveHelper.nextTab({ key: T.RIGHT, index: T.COUNT - 1, count: T.COUNT })).toBe(0);
    expect(UiPrimitiveHelper.nextTab({ key: T.LEFT, index: 0, count: T.COUNT })).toBe(T.COUNT - 1);
    expect(UiPrimitiveHelper.nextTab({ key: T.HOME, index: 1, count: T.COUNT })).toBe(0);
    expect(UiPrimitiveHelper.nextTab({ key: T.END, index: 0, count: T.COUNT })).toBe(T.COUNT - 1);
    expect(UiPrimitiveHelper.nextTab({ key: T.OTHER, index: 0, count: T.COUNT })).toBeNull();
  });
});
