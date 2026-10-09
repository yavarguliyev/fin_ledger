export interface ChatPreferences {
  muted: boolean;
  mutedUntil: string | null;
  pinnedAt: string | null;
  favourite: boolean;
  theme: string | null;
}

export interface PreferenceRequestDto {
  token: string;
  path: string;
  body: Record<string, unknown>;
  conversationId?: string;
}

export interface SeededConversation {
  conversationId: string;
}

export interface ListedConversation extends ChatPreferences {
  id: string;
}
