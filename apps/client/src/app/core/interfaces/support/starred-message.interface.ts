export interface StarredMessage {
  messageId: string;
  conversationId: string;
  kind: string;
  body: string | null;
  fileName: string | null;
  createdAt: string;
  starredAt: string;
}
