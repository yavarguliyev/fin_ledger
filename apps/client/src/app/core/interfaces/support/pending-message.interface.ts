export interface PendingMessage {
  localId: string;
  conversationId: string;
  body: string;
  replyToMessageId?: string;
}
