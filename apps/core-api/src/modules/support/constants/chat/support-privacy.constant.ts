export const SUPPORT_PRIVACY = {
  SET_SQL: `
    UPDATE support_conversations
       SET privacy_enabled = $2, privacy_changed_by = $3, privacy_changed_at = now(), updated_at = now()
     WHERE id = $1 AND privacy_enabled IS DISTINCT FROM $2
    RETURNING id
  `,
  ON_NOTICE: 'Advanced chat privacy is on. Media and files can be viewed in the chat but not downloaded by the other person.',
  OFF_NOTICE: 'Advanced chat privacy is off.',
  DOWNLOAD_BLOCKED_MESSAGE: 'Advanced chat privacy is on, so only the sender can download this file',
  NO_FILE_MESSAGE: 'File not found',
  DOWNLOAD_TTL_SECONDS: 60,
  AUDIT_ACTION: 'SUPPORT_PRIVACY_CHANGED',
  AUDIT_ENTITY_TYPE: 'SupportConversation',
  AUDIT_ENTITY_ID_PARAM: 'id'
} as const;
