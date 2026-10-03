import type { Reaction } from './reaction.interface';

export interface ReactionPickDto {
  reactions: Reaction[];
  myUserId: string | null;
  emoji: string;
}
