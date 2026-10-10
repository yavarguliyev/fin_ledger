import { SparklineHelper } from '../../../src/app/core/helpers/ui/sparkline.helper';
import { SPARKLINE } from '../../../src/app/core/constants/ui/sparkline.constant';

describe('SparklineHelper.points', () => {
  it('draws nothing for fewer than two values', () => {
    expect(SparklineHelper.points({ values: [5] })).toBe('');
  });

  it('spans the full width and puts the highest value at the top', () => {
    const points = SparklineHelper.points({ values: [0, 10] }).split(' ');

    expect(points).toEqual([`0,${SPARKLINE.HEIGHT - SPARKLINE.PADDING}`, `${SPARKLINE.WIDTH},${SPARKLINE.PADDING}`]);
  });

  it('draws a flat series through the middle', () => {
    expect(SparklineHelper.points({ values: [3, 3] })).toBe(`0,${SPARKLINE.HEIGHT / 2} ${SPARKLINE.WIDTH},${SPARKLINE.HEIGHT / 2}`);
  });
});
