export interface MessageLink {
  id: string;
  messageId: string;
  url: string;
  body: string | null;
  senderName: string | null;
  createdAt: string;
}
