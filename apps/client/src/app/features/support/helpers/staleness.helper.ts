import { StalenessDto } from '../interfaces/staleness.interface';

export class StalenessHelper {
  static isStale ({ lastAt, now, maxAgeMs }: StalenessDto): boolean {
    return now - lastAt >= maxAgeMs;
  }
}
