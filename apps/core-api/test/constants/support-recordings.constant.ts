export const SUPPORT_RECORDINGS_TEST = {
  CUSTOMER_EMAIL: 'recordings-customer@support-tests.realtime-wallet-payments.com',
  FILES_FIELD: 'files',
  DURATION_FIELD: 'durationSeconds',
  AUDIO_TYPE: 'audio/webm;codecs=opus',
  AUDIO_NAME: 'voice-note.webm',
  FAKE_AUDIO: 'not really audio',
  TOO_LONG_SECONDS: '901',
  VOICE_ROW_SQL: `INSERT INTO support_messages (conversation_id, sender_user_id, kind, source, storage_key, file_name, mime_type, size_bytes, duration_seconds)
    VALUES ($1, (SELECT id FROM users WHERE email = $2), 'VOICE', 'WEB', 'support/test/voice', 'voice.webm', 'audio/webm', 10, 3) RETURNING id`,
  NEW_TEXT: 'trying to edit a voice note',
  BAD_REQUEST: 400,
  UNSUPPORTED: 415
} as const;
