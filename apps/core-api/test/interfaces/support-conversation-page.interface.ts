export interface ConversationPageRow {
  id: string;
  lastMessageAt: string;
}

export interface ConversationPageQuery {
  query: Record<string, string>;
}

export interface ConversationPageCursor {
  row: ConversationPageRow | undefined;
}

export interface ConversationIdRow {
  id: string;
}
