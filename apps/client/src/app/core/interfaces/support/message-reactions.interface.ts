import type { Reaction } from './reaction.interface';

export interface MessageReactionsDto {
  messageId: string;
  reactions: Reaction[];
}
