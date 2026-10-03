import { readFileSync } from 'node:fs';

import { REDUCED_MOTION_TEST as T } from '../constants/reduced-motion.constant';

const block = T.BLOCK.exec(readFileSync(T.GLOBAL_STYLES, T.ENCODING))?.[1] ?? '';

describe('Reduced motion', () => {
  it('stops looping animations such as the ringing pulse and spinners on every element', () => {
    expect(block).toMatch(T.EVERY_ELEMENT);
    expect(block).toMatch(T.STOPS_ANIMATION);
    expect(block).toMatch(T.SHORTENS_ANIMATION);
  });

  it('makes transitions instant', () => {
    expect(block).toMatch(T.SHORTENS_TRANSITION);
  });
});
