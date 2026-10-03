import { FocusStepDto } from '../../interfaces/ui/focus-step.interface';

export class FocusTrapHelper {
  static wrapTo ({ count, current, backwards }: FocusStepDto): number | null {
    if (count === 0) return null;
    if (backwards) return current <= 0 ? count - 1 : null;
    return current < 0 || current >= count - 1 ? 0 : null;
  }
}
