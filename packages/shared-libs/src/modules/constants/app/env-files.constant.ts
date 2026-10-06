const LOCAL = '.env.local';
const AWS = '.env.aws';

export const ENV_FILES = {
  LOCAL,
  AWS,
  PRECEDENCE: [AWS, LOCAL]
} as const;
