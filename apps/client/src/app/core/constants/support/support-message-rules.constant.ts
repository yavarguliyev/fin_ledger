export const SUPPORT_MESSAGE_RULES = {
  EDIT_WINDOW_MS: 15 * 60 * 1000,
  DELETE_FOR_EVERYONE_WINDOW_MS: 48 * 60 * 60 * 1000,
  SCOPE_PARAM: 'scope',
  SYSTEM_KIND: 'SYSTEM',
  RECORDED_KINDS: ['VOICE', 'VIDEO'] as readonly string[],
  SCOPE_ME: 'ME',
  SCOPE_EVERYONE: 'EVERYONE',
  DELETE_ACTION: 'Delete message',
  DELETE_TITLE: 'Delete message?',
  DELETE_FOR_ME: 'Delete for me',
  DELETE_FOR_EVERYONE: 'Delete for everyone',
  CANCEL: 'Cancel',
  DELETED_TEXT: 'This message was deleted',
  YOU_DELETED_TEXT: 'You deleted this message',
  DELETE_FAILED: 'Could not delete that message.'
} as const;
