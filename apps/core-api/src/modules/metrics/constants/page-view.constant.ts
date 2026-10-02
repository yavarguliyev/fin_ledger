export const PAGE_VIEW = {
  CONTROLLER_PATH: 'telemetry',
  ROUTE_PATH: 'page-view',
  REQUESTS: 'page_view_requests',
  DUPLICATES: 'page_view_duplicate_requests',
  REQUEST_LABELS: ['route', 'phase'],
  DUPLICATE_LABELS: ['route'],
  INITIAL_PHASE: 'initial',
  LATER_PHASE: 'later',
  BUCKETS: [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144],
  ROUTE_PATTERN: /^\/[A-Za-z0-9/:_-]{0,79}$/,
  MAX_CALLS: 10_000,
  MAX_ROUTES: 50,
  OTHER_ROUTE: 'other'
} as const;
