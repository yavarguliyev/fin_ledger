export const SUPPORT_MESSAGE_RULES = {
  EDIT_WINDOW_MS: 15 * 60 * 1000,
  DELETE_FOR_EVERYONE_WINDOW_MS: 48 * 60 * 60 * 1000,
  EDIT_EXPIRED_MESSAGE: 'Messages can only be edited for 15 minutes after sending',
  DELETE_EXPIRED_MESSAGE: 'Messages can only be deleted for everyone within 48 hours of sending',
  NOT_YOUR_MESSAGE_DELETE: 'You can only delete your own messages',
  ALREADY_DELETED_MESSAGE: 'This message was already deleted'
} as const;
