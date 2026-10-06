export const SAFE_URL = {
  PROTOCOLS: ['http:', 'https:'],
  IPV4: 'ipv4',
  IPV6: 'ipv6',
  MAPPED_IPV4_PREFIX: '::ffff:',
  IPV6_BRACKETS: /^\[|\]$/g,
  BLOCKED_IPV4: [
    ['0.0.0.0', 8],
    ['10.0.0.0', 8],
    ['100.64.0.0', 10],
    ['127.0.0.0', 8],
    ['169.254.0.0', 16],
    ['172.16.0.0', 12],
    ['192.0.0.0', 24],
    ['192.0.2.0', 24],
    ['192.168.0.0', 16],
    ['198.18.0.0', 15],
    ['198.51.100.0', 24],
    ['203.0.113.0', 24],
    ['224.0.0.0', 4],
    ['240.0.0.0', 4]
  ],
  BLOCKED_IPV6: [
    ['::', 128],
    ['::1', 128],
    ['64:ff9b::', 96],
    ['64:ff9b:1::', 48],
    ['100::', 64],
    ['2001:db8::', 32],
    ['2002::', 16],
    ['fc00::', 7],
    ['fe80::', 10],
    ['ff00::', 8]
  ],
  NOT_HTTP: 'Only http and https links can be previewed',
  HAS_CREDENTIALS: 'Links with credentials cannot be previewed',
  BLOCKED_ADDRESS: 'The link points to a private or reserved address',
  BLOCKED_CODE: 'ERR_BLOCKED_ADDRESS'
} as const;
