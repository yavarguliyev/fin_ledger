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

export interface SupportMessageRefDto extends SupportThreadDto {
  messageId: string;
}

export interface SupportRemoveDto extends SupportMessageRefDto {
  scope: string;
}

export interface SupportEditDto extends SupportMessageRefDto {
  text: string;
}

export interface SupportReactDto extends SupportTokenDto {
  path: string;
  emoji?: string;
}

export interface SupportStartDto {
  customerEmail: string;
  otherEmails?: string[];
}

export interface SupportSession {
  customer: string;
  staff: string;
  conversationId: string;
}
