export const SUPPORT = {
  RESOURCE: 'support',
  OPEN_STATUS: 'OPEN',
  DEFAULT_SUBJECT: 'Help request',
  BODY_MAX_LENGTH: 4000,
  SUBJECT_MAX_LENGTH: 200,
  PAGE_SIZE: 50,
  PAGE_SIZE_MAX: 100,
  CONVERSATION_PAGE_SIZE: 30,
  NOT_FOUND_MESSAGE: 'Conversation not found',
  REPLY_TARGET_MESSAGE: 'You can only reply to a message in this conversation',
  EMPTY_MESSAGE: 'A message needs text or an attachment',
  STAFF_CANNOT_OPEN_MESSAGE: 'Staff answer conversations, they do not open them',
  LAST_SEEN_STAFF_ONLY_MESSAGE: 'Only the support team can see when someone was last online',
  CLOSED_MESSAGE: 'This conversation is closed',
  STAFF_NOT_FOUND_MESSAGE: 'That support team member is not available'
} as const;
