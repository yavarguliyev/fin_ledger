import { BETTING_DRAW } from '../modules/constants/betting/betting-draw.constant';
import { BettingHelper } from '../modules/helpers/betting.helper';

describe('BettingHelper', () => {
  const margin = BETTING_DRAW.DEFAULT_MARGIN;
  const expectedEdge = margin / (1 + margin);
  const bets = 1_000_000;
  const sigmas = 5;

  const samplingTolerance = (odds: number): number => {
    const winChance = (1 - expectedEdge) / odds;
    const variancePerBet = odds ** 2 * winChance * (1 - winChance);

    return sigmas * Math.sqrt(variancePerBet / bets);
  };

  it.each([1.5, 2, 3, 5, 10])('keeps a positive house edge at odds %s over a million bets', odds => {
    let returned = 0;

    for (let i = 0; i < bets; i++) {
      if (BettingHelper.draw({ odds, margin }).won) returned += odds;
    }

    const edge = 1 - returned / bets;

    expect(edge).toBeGreaterThan(0);
    expect(Math.abs(edge - expectedEdge)).toBeLessThan(samplingTolerance(odds));
  }, 120_000);

  it.each([
    [2, 0, BETTING_DRAW.DRAW_RANGE / 2],
    [4, 0, BETTING_DRAW.DRAW_RANGE / 4],
    [2, 1, BETTING_DRAW.DRAW_RANGE / 4]
  ])('derives the win threshold from odds %s and margin %s', (odds, betMargin, expected) => {
    expect(BettingHelper.winThreshold({ odds, margin: betMargin })).toBe(expected);
  });

  it('never returns a draw outside the range', () => {
    const { drawValue, drawThreshold } = BettingHelper.draw({ odds: 2, margin });

    expect(drawValue).toBeGreaterThanOrEqual(0);
    expect(drawValue).toBeLessThan(BETTING_DRAW.DRAW_RANGE);
    expect(drawThreshold).toBeLessThan(BETTING_DRAW.DRAW_RANGE);
  });

  it.each([
    [1, margin],
    [0.5, margin],
    [2, -1]
  ])('rejects odds %s with margin %s', (odds, betMargin) => {
    expect(() => BettingHelper.winThreshold({ odds, margin: betMargin })).toThrow(RangeError);
  });
});
