export interface SupportConversation {
  id: string;
  customerUserId: string;
  assignedStaffId: string | null;
  status: string;
  unreadCount: number;
}

export interface SupportMessage {
  id: string;
  conversationId: string;
  senderUserId: string | null;
  body: string | null;
  kind: string;
  source: string;
  seen?: boolean;
}

export interface PresenceEntry {
  userId: string;
  displayName: string;
  role: string;
  state: string;
  lastSeenAt: string;
}

export interface PresenceEntry {
  userId: string;
  displayName: string;
  role: string;
  state: string;
  lastSeenAt: string;
}
