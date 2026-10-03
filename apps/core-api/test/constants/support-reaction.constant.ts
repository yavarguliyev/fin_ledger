import { HTTP_STATUS } from './http-status.constant';

export const SUPPORT_REACTION_TEST = {
  ...HTTP_STATUS,
  TEXT: 'Your refund went out this morning',
  THUMBS: '👍',
  HEART: '❤️',
  ANY_EMOJI: '🦄',
  FLAG: '🇦🇿',
  PLAIN_TEXT: 'ok',
  TWO_EMOJIS: '👍👍',
  REACTION_SUFFIX: '/reaction'
} as const;
