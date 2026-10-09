export interface ListedLastMessage {
  id: string;
  lastMessagePreview: string | null;
  lastMessageSenderId: string | null;
  lastMessageKind: string | null;
  lastMessageSeen: boolean;
  lastMessageDeleted: boolean;
}
