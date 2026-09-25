import { GameEventStatus } from '@common/libs';

export const GAME_EVENT_TRANSITIONS: Record<GameEventStatus, GameEventStatus[]> = {
  [GameEventStatus.SCHEDULED]: [GameEventStatus.LIVE, GameEventStatus.POSTPONED, GameEventStatus.CANCELLED],
  [GameEventStatus.LIVE]: [GameEventStatus.FINISHED, GameEventStatus.CANCELLED],
  [GameEventStatus.FINISHED]: [GameEventStatus.SETTLED],
  [GameEventStatus.POSTPONED]: [GameEventStatus.SCHEDULED, GameEventStatus.CANCELLED],
  [GameEventStatus.SETTLED]: [],
  [GameEventStatus.CANCELLED]: []
};

export const GAME_EVENT_RESULT_STATUSES: GameEventStatus[] = [GameEventStatus.FINISHED, GameEventStatus.SETTLED];
