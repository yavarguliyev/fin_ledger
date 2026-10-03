export const MESSAGE_REACTION = {
  ALLOWED: ['👍', '❤️', '😂', '😮', '😢', '🙏'],
  EVENT: 'support.message.reacted',
  PATH: '/reaction',
  PICK_LABEL: 'React',
  FAILED: 'Could not save your reaction'
} as const;
