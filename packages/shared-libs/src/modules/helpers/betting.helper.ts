import * as crypto from 'node:crypto';

import { BETTING_DRAW } from '../constants/betting/betting-draw.constant';
import { BetDrawDto } from '../dtos/helper/bet-draw.dto';
import { BetDrawResultDto } from '../dtos/helper/bet-draw-result.dto';

export class BettingHelper {
  static winThreshold ({ odds, margin }: BetDrawDto): number {
    if (!Number.isFinite(odds) || odds <= BETTING_DRAW.MIN_ODDS) throw new RangeError('Odds must be greater than 1');
    if (!Number.isFinite(margin) || margin < 0) throw new RangeError('Margin cannot be negative');

    return Math.floor(BETTING_DRAW.DRAW_RANGE / (odds * (1 + margin)));
  }

  static draw (params: BetDrawDto): BetDrawResultDto {
    const drawThreshold = BettingHelper.winThreshold(params);
    const drawValue = crypto.randomInt(BETTING_DRAW.DRAW_RANGE);

    return { drawValue, drawThreshold, won: drawValue < drawThreshold };
  }
}
