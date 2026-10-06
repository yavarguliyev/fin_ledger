export const SAFE_URL_SPEC = {
  BLOCKED: ['127.0.0.1', '10.1.2.3', '172.20.0.1', '192.168.1.10', '169.254.169.254', '100.64.0.1', '0.0.0.0', '::1', '::', 'fe80::1', 'fd00::1', '::ffff:127.0.0.1', '::ffff:10.0.0.1', '64:ff9b::a00:1', 'not-an-ip'],
  PUBLIC: ['93.184.216.34', '8.8.8.8', '2606:4700:4700::1111', '::ffff:8.8.8.8'],
  ALLOWED_URLS: ['https://example.com/page', 'http://example.com'],
  REFUSED_URLS: ['ftp://example.com/file', 'javascript:alert(1)', 'file:///etc/passwd', 'https://user:secret@example.com', 'http://127.0.0.1:3000/admin', 'http://[::1]/', 'http://169.254.169.254/latest/meta-data'],
  LOOPBACK_HOST: 'localhost',
  BLOCKED_CODE: 'ERR_BLOCKED_ADDRESS'
} as const;
