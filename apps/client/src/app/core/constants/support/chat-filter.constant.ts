export const CHAT_FILTER = {
  ALL: 'ALL',
  UNREAD: 'UNREAD',
  FAVOURITES: 'FAVOURITES',
  OPTIONS: [
    { id: 'ALL', label: 'All' },
    { id: 'UNREAD', label: 'Unread' },
    { id: 'FAVOURITES', label: 'Favourites' }
  ],
  EMPTY: { ALL: '', UNREAD: 'No unread chats.', FAVOURITES: 'No favourites yet. Add one from contact info.' },
  LABEL: 'Filter chats',
  PINNED_LABEL: 'Pinned',
  MUTED_LABEL: 'Muted'
} as const;
