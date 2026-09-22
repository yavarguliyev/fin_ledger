import { GameStatus } from '../../types/betting/game-status.type';
import { CreatedAt } from '../base/created-at.interface';
import { Id } from '../base/id.interface';
import { UpdatedAt } from '../base/updated-at.interface';

export interface GameEvent extends Id, CreatedAt, UpdatedAt {
  label: string;
  odds: number;
  status: GameStatus;
}
