export interface EditMessageDto {
  conversationId: string;
  messageId: string;
  body: string;
  file: File | null;
}
