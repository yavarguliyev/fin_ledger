import { join } from 'node:path';

export const COLOUR_CONTRAST_TEST = {
  CONFIG: join(__dirname, '..', '..', 'tailwind.config.js'),
  LIGHT_ROOT: ':root',
  PRIMARY_VAR: '--color-primary',
  PRIMARY: 'primary',
  WHITE: 'white',
  WHITE_RGB: [255, 255, 255],
  DEFAULT: 'DEFAULT',
  PATH_SEPARATOR: '.',
  HEX_PREFIX: '#',
  EMPTY: '',
  HEX_RADIX: 16,
  CHANNEL_MAX: 255,
  CHANNEL_SPACE: ' ',
  MIN_RATIO: 4.5,
  LINEAR_LIMIT: 0.03928,
  LINEAR_DIVISOR: 12.92,
  GAMMA_OFFSET: 0.055,
  GAMMA_SCALE: 1.055,
  GAMMA: 2.4,
  LUMA: [0.2126, 0.7152, 0.0722],
  FLARE: 0.05,
  TINT: 0.1,
  PAIRS: [
    { LABEL: 'white on the light-theme primary', FG: 'white', BG: 'primary', TINTED: false },
    { LABEL: 'light-theme primary on its own tint', FG: 'primary', BG: 'primary', TINTED: true },
    { LABEL: 'white on success.deep', FG: 'white', BG: 'success.deep', TINTED: false },
    { LABEL: 'white on danger.dark', FG: 'white', BG: 'danger.dark', TINTED: false },
    { LABEL: 'success.deep on the success tint', FG: 'success.deep', BG: 'success', TINTED: true },
    { LABEL: 'warning.deep on the warning tint', FG: 'warning.deep', BG: 'warning', TINTED: true },
    { LABEL: 'danger.deep on the danger tint', FG: 'danger.deep', BG: 'danger', TINTED: true },
    { LABEL: 'ink.600 on white', FG: 'ink.600', BG: 'white', TINTED: false },
    { LABEL: 'night.muted on night.surface', FG: 'night.muted', BG: 'night.surface', TINTED: false }
  ]
} as const;
