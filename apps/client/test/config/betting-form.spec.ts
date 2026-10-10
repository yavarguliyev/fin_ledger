import { readFileSync } from 'node:fs';

import { BETTING_FORM_TEST as T } from '../constants/betting-form.constant';

describe('Betting page', () => {
  const template = readFileSync(T.TEMPLATE, T.ENCODING);
  const card = readFileSync(T.FIXTURE_CARD, T.ENCODING);

  it('disables the stake control in the component, not with a disabled attribute on a reactive control', () => {
    expect(template).not.toMatch(T.BOUND_CONTROL);
    expect(readFileSync(T.COMPONENT, T.ENCODING)).toMatch(T.DISABLED_AT_START);
  });

  it('colours fixture statuses with the theme-aware Live Depth status tokens so LIVE stays readable', () => {
    expect(card).toContain(T.LIVE_TOKEN);
    expect(card).toContain(T.IDLE_TOKEN);
  });

  it('offers a fixture for selection only before it has started', () => {
    expect(card).toMatch(T.LIVE_GUARD);
  });
});
