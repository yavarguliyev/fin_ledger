export const PAGE_VIEW_TEST = {
  PATH: '/telemetry/page-view',
  ROUTE: '/wallet-telemetry-probe',
  BAD_ROUTE: 'https://evil.example/<script>',
  TEXT_TYPE: 'text/plain;charset=UTF-8',
  JSON_TYPE: 'application/json',
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  INITIAL: 4,
  LATER: 2,
  DUPLICATES: 1,
  METRICS_PATH: '/metrics',
  API_SUFFIX: /\/api\/v\d+$/,
  INITIAL_SERIES: 'core_api_page_view_requests_count{route="/wallet-telemetry-probe",phase="initial"}',
  DUPLICATE_SERIES: 'core_api_page_view_duplicate_requests_sum{route="/wallet-telemetry-probe"} 1'
} as const;
