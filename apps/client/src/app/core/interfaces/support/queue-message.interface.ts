export interface QueueMessageDto {
  conversationId: string;
  body: string;
  replyToMessageId?: string;
}
