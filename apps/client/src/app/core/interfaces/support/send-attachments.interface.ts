export interface SendAttachmentsDto {
  conversationId: string;
  body: string;
  files: File[];
  durationSeconds?: number;
}
