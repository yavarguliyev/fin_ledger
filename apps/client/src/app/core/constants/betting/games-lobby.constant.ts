export const GAMES_LOBBY = {
  TITLE: 'Games',
  SUBTITLE: 'Every result is decided on the server and can be verified after the round.',
  LIMITS_LABEL: 'Limits',
  LIMITS_ROUTE: '/wallet',
  FILTERS: [
    { id: 'ALL', label: 'All' },
    { id: 'ORIGINALS', label: 'Originals' },
    { id: 'LIVE', label: 'Live sports' }
  ],
  FILTER: { ALL: 'ALL', ORIGINALS: 'ORIGINALS', LIVE: 'LIVE' },
  CRASH: {
    ROUTE: '/games/crash',
    BADGE: 'Coming soon',
    NAME: 'Crash',
    DESCRIPTION: 'The rocket climbs and the multiplier grows. Cash out before it crashes — the longer you hold, the more you win.',
    ACTION: 'Play Crash',
    MULTIPLIER: '3.41×'
  },
  LIVE_SPORTS: 'Live sports'
} as const;
