export interface PinnedMessage {
  id: string;
  body: string | null;
  kind: string;
}

export interface PinRequestDto {
  token: string;
  messageId: string;
  method: 'PUT' | 'DELETE';
  duration?: string;
}
