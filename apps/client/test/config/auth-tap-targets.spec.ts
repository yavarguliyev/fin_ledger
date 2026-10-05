import { readFileSync } from 'node:fs';

import { AUTH_TAP_TARGETS_TEST as T } from '../constants/auth-tap-targets.constant';

const classesOf = (pattern: RegExp, html: string): string[][] => [...html.matchAll(pattern)].map(([, classes]) => classes?.split(' ') ?? []);

describe('Sign-in and sign-up tap targets', () => {
  T.TEMPLATES.forEach(path => {
    const html = readFileSync(path, T.ENCODING);

    it(`makes every password toggle and link at least 44 px tall in ${path}`, () => {
      const toggles = classesOf(T.TOGGLE, html);
      const links = classesOf(T.LINK, html);

      expect(toggles.length).toBeGreaterThan(0);
      toggles.forEach(classes => expect(classes).toEqual(expect.arrayContaining([...T.SQUARE])));
      links.forEach(classes => expect(classes).toEqual(expect.arrayContaining([...T.TALL_LINK])));
    });
  });

  it('gives the terms checkbox a 44 px hit area', () => {
    expect(readFileSync(T.REGISTER, T.ENCODING)).toMatch(T.TERMS_BOX);
  });
});
