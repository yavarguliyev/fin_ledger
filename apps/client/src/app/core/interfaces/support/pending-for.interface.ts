import type { PendingMessage } from './pending-message.interface';

export interface PendingForDto {
  pending: PendingMessage[];
  conversationId: string | null;
}
