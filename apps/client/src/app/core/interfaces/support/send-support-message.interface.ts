export interface SendSupportMessageDto {
  conversationId: string;
  body: string;
  replyToMessageId?: string;
}
