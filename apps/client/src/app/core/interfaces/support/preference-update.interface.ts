export interface PreferenceUpdateDto {
  conversationId: string;
  path: string;
  body: Record<string, unknown>;
}
