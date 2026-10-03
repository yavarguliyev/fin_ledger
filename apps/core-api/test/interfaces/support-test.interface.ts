export interface SupportTokenDto {
  token: string;
}

export interface SupportEmailDto {
  email: string;
}

export interface SupportConversationRefDto {
  conversationId: string;
}

export interface SupportOpenDto extends SupportTokenDto {
  staffUserId: string;
  subject?: string;
}

export interface SupportThreadDto extends SupportTokenDto, SupportConversationRefDto {}

export interface SupportSendDto extends SupportThreadDto {
  body: string;
  replyToMessageId?: string;
}

export interface SupportMultipartDto extends SupportThreadDto {
  method: 'PATCH' | 'POST';
  path: string;
  form: FormData;
}
