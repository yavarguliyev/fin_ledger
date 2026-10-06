export const SUPPORT_EVENTS = {
  MESSAGE_CREATED: 'support.message.created',
  MESSAGE_UPDATED: 'support.message.updated',
  MESSAGE_REACTED: 'support.message.reacted',
  CONVERSATION_READ: 'support.conversation.read',
  CONVERSATION_UPDATED: 'support.conversation.updated',
  CONVERSATION_TYPING: 'support.conversation.typing',
  PRESENCE_CHANGED: 'support.presence.changed',
  CALL_INCOMING: 'support.call.incoming',
  CALL_ANSWERED: 'support.call.answered',
  CALL_CANDIDATE: 'support.call.candidate',
  CALL_RENEGOTIATE: 'support.call.renegotiate',
  CALL_ENDED: 'support.call.ended'
} as const;
