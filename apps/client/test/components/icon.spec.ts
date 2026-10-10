import { ICON_PATHS } from '../../src/app/core/constants/ui/icon.constant';
import { NOTIFICATION_DISPLAY_FALLBACK, NOTIFICATION_ICONS } from '../../src/app/core/constants/notification/notification-display.constant';

describe('ICON_PATHS', () => {
  it.each(Object.entries(ICON_PATHS))('%s has at least one SVG path that starts with a move command', (_name, paths) => {
    expect(paths.length).toBeGreaterThan(0);
    paths.forEach(path => expect(path).toMatch(/^[Mm]/));
  });

  it.each([...Object.values(NOTIFICATION_ICONS), NOTIFICATION_DISPLAY_FALLBACK.ICON])('notification icon %s is in the icon set', name => {
    expect(ICON_PATHS).toHaveProperty([name]);
  });
});
