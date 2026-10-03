import type { Reaction } from './reaction.interface';

export interface ReactionsOfDto {
  reactions: Reaction[];
  myUserId: string | null;
}
