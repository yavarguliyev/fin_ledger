import { HTTP_STATUS } from './http-status.constant';

export const MESSAGE_SEARCH_TEST = {
  ...HTTP_STATUS,
  PERCENT_TEXT: 'Is the 50% bonus still running?',
  PLAIN_TEXT: 'My bonus deposit has not arrived',
  OTHER_TEXT: 'Thanks for the quick answer',
  BONUS: 'BONUS',
  PERCENT: '50%',
  UNDERSCORE: '_',
  TOO_SHORT: 'a',
  SEARCH_SUFFIX: '/messages/search?q='
} as const;
