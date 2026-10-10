import { CrashStakeHelper } from '../../../src/app/core/helpers/games/crash-stake.helper';
import { CRASH_GAME } from '../../../src/app/core/constants/games/crash.constant';

describe('CrashStakeHelper', () => {
  it('halves and doubles the stake to the cent', () => {
    expect(CrashStakeHelper.apply({ stake: 10.01, action: CRASH_GAME.QUICK_ACTION.HALF })).toBe(5.01);
    expect(CrashStakeHelper.apply({ stake: 10, action: CRASH_GAME.QUICK_ACTION.DOUBLE })).toBe(20);
  });

  it('sets a preset amount and keeps the stake for an unknown action', () => {
    expect(CrashStakeHelper.apply({ stake: 3, action: 'fifty' })).toBe(50);
    expect(CrashStakeHelper.apply({ stake: 3, action: 'unknown' })).toBe(3);
  });

  it('reads typed stakes and falls back to the minimum for bad input', () => {
    expect(CrashStakeHelper.parse('12.5')).toBe(12.5);
    expect(CrashStakeHelper.parse('-4')).toBe(CRASH_GAME.MIN_STAKE);
    expect(CrashStakeHelper.parse('abc')).toBe(CRASH_GAME.MIN_STAKE);
  });
});
