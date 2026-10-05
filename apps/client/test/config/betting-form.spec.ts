import { readFileSync } from 'node:fs';

import { EVENT_BADGE } from '../../src/app/core/constants/betting/event-badge.constant';
import { BETTING_FORM_TEST as T } from '../constants/betting-form.constant';

describe('Betting page', () => {
  const template = readFileSync(T.TEMPLATE, T.ENCODING);

  it('disables the stake control in the component, not with a disabled attribute on a reactive control', () => {
    expect(template).not.toMatch(T.BOUND_CONTROL);
    expect(readFileSync(T.COMPONENT, T.ENCODING)).toMatch(T.DISABLED_AT_START);
  });

  it('gives both event badges their own dark-mode colours so LIVE stays readable', () => {
    [EVENT_BADGE.LIVE, EVENT_BADGE.IDLE].forEach(classes => {
      expect(classes).toContain(T.DARK_TEXT);
      expect(classes).toContain(T.DARK_BACKGROUND);
    });
  });

  it('offers Select only for fixtures that have not started', () => {
    expect(template).toMatch(T.LIVE_GUARD);
  });
});
