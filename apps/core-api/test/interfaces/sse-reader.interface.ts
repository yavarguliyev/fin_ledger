export interface SseOpenRequest {
  path: string;
}

export interface SseWaitRequest {
  type: string;
  timeoutMs: number;
}

export interface SseEvent {
  type: string;
  conversationId?: string;
  typingUserId?: string;
}
