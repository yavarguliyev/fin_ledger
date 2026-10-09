export const CHAT_MUTE = {
  OPTIONS: [
    { duration: 'EIGHT_HOURS', label: '8 hours' },
    { duration: 'ONE_WEEK', label: '1 week' },
    { duration: 'ALWAYS', label: 'Always' }
  ],
  OFF: 'OFF',
  HINT: 'Muted chats stay in your list but are left out of the unread badge.',
  UNMUTE: 'Unmute',
  UNTIL: 'Until',
  ALWAYS: 'Always',
  UNTIL_FORMAT: 'MMM d, h:mm a',
  ROW: 'Mute notifications',
  THEME_ROW: 'Chat theme',
  ADD_FAVOURITE: 'Add to favourites',
  REMOVE_FAVOURITE: 'Remove from favourites',
  PIN: 'Pin chat',
  UNPIN: 'Unpin chat'
} as const;
