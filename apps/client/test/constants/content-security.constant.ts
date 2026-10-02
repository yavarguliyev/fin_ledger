export const CONTENT_SECURITY_SPEC = {
  ANGULAR_JSON: '../../angular.json',
  INDEX_HTML: '../../src/index.html',
  ENCODING: 'utf8',
  PROJECT: 'demo',
  BASE_POLICY: "object-src 'none'; base-uri 'self'; form-action 'self'"
} as const;
