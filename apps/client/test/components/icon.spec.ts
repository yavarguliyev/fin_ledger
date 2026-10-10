import { ICON_PATHS } from '../../src/app/core/constants/ui/icon.constant';

describe('ICON_PATHS', () => {
  it.each(Object.entries(ICON_PATHS))('%s has at least one SVG path that starts with a move command', (_name, paths) => {
    expect(paths.length).toBeGreaterThan(0);
    paths.forEach(path => expect(path).toMatch(/^[Mm]/));
  });
});
