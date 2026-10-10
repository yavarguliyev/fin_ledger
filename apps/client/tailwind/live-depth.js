const TOKENS = {
  ground: { dark: '11 10 26', light: '244 243 251' },
  'surface-1': { dark: '21 20 43', light: '255 255 255' },
  'surface-2': { dark: '30 28 58', light: '247 246 255' },
  line: { dark: '44 42 77', light: '228 226 243' },
  rail: { dark: '16 15 34', light: '255 255 255' },
  'rail-line': { dark: '31 29 59', light: '228 226 243' },
  text: { dark: '244 243 255', light: '20 19 43' },
  'text-muted': { dark: '166 163 201', light: '92 89 128' },
  action: { dark: '106 72 245', light: '106 72 245' },
  'action-dark': { dark: '79 47 217', light: '79 47 217' },
  live: { dark: '34 211 238', light: '8 145 178' },
  win: { dark: '163 230 53', light: '77 124 15' },
  loss: { dark: '255 107 107', light: '192 57 43' },
  pending: { dark: '251 191 36', light: '180 83 9' },
  raised: { dark: '58 38 168', light: '58 38 168' },
  'raised-dark': { dark: '30 20 96', light: '30 20 96' },
  'raised-tint': { dark: '228 222 255', light: '228 222 255' },
  'raised-live': { dark: '103 232 249', light: '103 232 249' }
};

const variable = name => `--ld-${name}`;

const colors = Object.fromEntries(Object.keys(TOKENS).map(name => [name, `rgb(var(${variable(name)}) / <alpha-value>)`]));

const themeVariables = mode => Object.fromEntries(Object.entries(TOKENS).map(([name, values]) => [variable(name), values[mode]]));

const fontFamily = {
  display: ['Unbounded', 'system-ui', 'sans-serif'],
  ui: ['Plus Jakarta Sans', 'system-ui', 'sans-serif']
};

const plugin = ({ addBase, addComponents }) => {
  addBase({
    ':root': themeVariables('light'),
    'html.dark': themeVariables('dark')
  });
  addComponents({
    '.depth-1': {
      boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.06), 0 8px 24px -12px rgb(0 0 0 / 0.6)'
    },
    '.depth-2': {
      position: 'relative',
      overflow: 'hidden',
      color: 'rgb(255 255 255)',
      backgroundImage: `linear-gradient(135deg, rgb(var(${variable('raised')})), rgb(var(${variable('raised-dark')})))`,
      boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.18), 0 18px 40px -16px rgb(106 72 245 / 0.65)'
    },
    '.nav-glow': {
      backgroundColor: `rgb(var(${variable('action')}) / 0.22)`,
      boxShadow: `inset 0 1px 0 rgb(255 255 255 / 0.08), 0 0 24px -6px rgb(var(${variable('action')}) / 0.6)`
    },
    '.light-sweep': {
      position: 'absolute',
      top: '0',
      bottom: '0',
      left: '0',
      width: '22%',
      pointerEvents: 'none',
      backgroundImage: 'linear-gradient(90deg, rgb(255 255 255 / 0), rgb(255 255 255 / 0.09), rgb(255 255 255 / 0))',
      animation: 'ld-sweep 5s ease-in-out infinite'
    },
    '.live-pulse': {
      borderRadius: '9999px',
      backgroundColor: `rgb(var(${variable('live')}))`,
      animation: 'ld-pulse 1.8s ease-out infinite'
    },
    '@keyframes ld-sweep': {
      '0%': { transform: 'translateX(-120%) skewX(-18deg)' },
      '100%': { transform: 'translateX(420%) skewX(-18deg)' }
    },
    '@keyframes ld-pulse': {
      '0%': { boxShadow: `0 0 0 0 rgb(var(${variable('live')}) / 0.55)` },
      '70%': { boxShadow: `0 0 0 10px rgb(var(${variable('live')}) / 0)` },
      '100%': { boxShadow: `0 0 0 0 rgb(var(${variable('live')}) / 0)` }
    },
    '.glossy-raised': {
      color: `rgb(var(${variable('raised-dark')}))`,
      backgroundImage: `linear-gradient(180deg, rgb(255 255 255), rgb(var(${variable('raised-tint')})))`,
      boxShadow: 'inset 0 1px 0 rgb(255 255 255), 0 12px 24px -10px rgb(0 0 0 / 0.6)',
      transition: 'transform 120ms ease-out',
      '&:active': { transform: 'translateY(1px)' }
    },
    '.glossy': {
      color: 'rgb(255 255 255)',
      backgroundImage: `linear-gradient(180deg, rgb(var(${variable('action')})), rgb(var(${variable('action-dark')})))`,
      boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.25), 0 10px 24px -10px rgb(106 72 245 / 0.7)',
      transition: 'transform 120ms ease-out, box-shadow 120ms ease-out',
      '&:active:not(:disabled)': {
        transform: 'translateY(1px)',
        boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.25), 0 5px 12px -5px rgb(106 72 245 / 0.7)'
      },
      '&:disabled': { opacity: '0.5', cursor: 'not-allowed' }
    }
  });
};

module.exports = { colors, fontFamily, plugin };
