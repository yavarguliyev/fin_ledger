import { GameEvent } from '../../interfaces/betting/game-event.interface';

export interface PlaceBetDto {
  event: GameEvent;
  stakeMinor: number;
}
