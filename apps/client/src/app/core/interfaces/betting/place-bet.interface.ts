import { GameEvent } from './game-event.interface';

export interface PlaceBetDto {
  event: GameEvent;
  stakeMinor: number;
}
