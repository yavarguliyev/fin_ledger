import { SPARKLINE } from '../../constants/ui/sparkline.constant';
import { SparklinePointsDto } from '../../interfaces/ui/sparkline-points.interface';

export class SparklineHelper {
  static points ({ values }: SparklinePointsDto): string {
    if (values.length < 2) return '';

    const min = Math.min(...values);
    const range = Math.max(...values) - min;
    const drawable = SPARKLINE.HEIGHT - SPARKLINE.PADDING * 2;
    const step = SPARKLINE.WIDTH / (values.length - 1);

    return values
      .map((value, index) => {
        const y = range === 0 ? SPARKLINE.HEIGHT / 2 : SPARKLINE.HEIGHT - SPARKLINE.PADDING - ((value - min) / range) * drawable;
        return `${index * step},${y}`;
      })
      .join(' ');
  }
}
