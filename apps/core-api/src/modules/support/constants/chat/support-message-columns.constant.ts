export const SUPPORT_MESSAGE_COLUMNS = {
  TABLE: 'support_messages',
  MAPPINGS: {
    conversationId: 'conversation_id',
    senderUserId: 'sender_user_id',
    storageKey: 'storage_key',
    fileName: 'file_name',
    mimeType: 'mime_type',
    sizeBytes: 'size_bytes',
    durationSeconds: 'duration_seconds',
    externalId: 'external_id',
    replyToMessageId: 'reply_to_message_id',
    editedAt: 'edited_at',
    deletedAt: 'deleted_at',
    createdAt: 'created_at'
  },
  SELECT: [
    'id',
    'conversationId',
    'senderUserId',
    'kind',
    'source',
    'body',
    'storageKey',
    'fileName',
    'mimeType',
    'sizeBytes',
    'durationSeconds',
    'editedAt',
    'deletedAt',
    'createdAt',
    'replyToMessageId'
  ]
} as const;
