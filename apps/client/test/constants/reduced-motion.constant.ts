import { join } from 'node:path';

export const REDUCED_MOTION_TEST = {
  GLOBAL_STYLES: join(__dirname, '..', '..', 'src', 'global_styles.css'),
  ENCODING: 'utf8',
  BLOCK: /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{([\s\S]*?\})\s*\}/,
  STOPS_ANIMATION: /animation-iteration-count:\s*1\s*!important/,
  SHORTENS_ANIMATION: /animation-duration:\s*0\.01ms\s*!important/,
  SHORTENS_TRANSITION: /transition-duration:\s*0\.01ms\s*!important/,
  EVERY_ELEMENT: /\*,\s*\*::before,\s*\*::after/
} as const;
