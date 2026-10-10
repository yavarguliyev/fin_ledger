import { CRASH_GAME } from '../../constants/games/crash.constant';
import { CrashStakeDto } from '../../interfaces/games/crash-stake.interface';

export class CrashStakeHelper {
  static apply ({ stake, action }: CrashStakeDto): number {
    const { QUICK, QUICK_ACTION, HALF, DOUBLE, CENTS } = CRASH_GAME;
    if (action === QUICK_ACTION.HALF) return Math.round(stake * HALF * CENTS) / CENTS;
    if (action === QUICK_ACTION.DOUBLE) return Math.round(stake * DOUBLE * CENTS) / CENTS;

    const preset = QUICK.find(option => option.id === action);
    return preset && 'amount' in preset ? preset.amount : stake;
  }

  static parse (value: string): number {
    const amount = Number(value);
    return Number.isFinite(amount) && amount > CRASH_GAME.MIN_STAKE ? amount : CRASH_GAME.MIN_STAKE;
  }
}
