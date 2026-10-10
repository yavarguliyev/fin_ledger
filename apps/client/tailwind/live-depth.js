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
  'raised-mid': { dark: '36 21 122', light: '36 21 122' },
  'raised-deep': { dark: '22 14 77', light: '22 14 77' },
  'raised-muted': { dark: '207 199 255', light: '207 199 255' },
  'on-tint': { dark: '11 10 26', light: '11 10 26' },
  'raised-ice': { dark: '205 231 245', light: '205 231 245' },
  'raised-sky': { dark: '166 207 230', light: '166 207 230' },
  'raised-tint': { dark: '228 222 255', light: '228 222 255' },
  'raised-live': { dark: '103 232 249', light: '103 232 249' },
  'raised-win': { dark: '163 230 53', light: '163 230 53' },
  'raised-pending': { dark: '251 191 36', light: '251 191 36' }
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
      backgroundImage: `linear-gradient(135deg, rgb(var(${variable('raised')})) 0%, rgb(var(${variable('raised-mid')})) 55%, rgb(var(${variable('raised-deep')})) 100%)`,
      boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.18), 0 30px 60px -28px rgb(106 72 245 / 0.75)'
    },
    '.rim': {
      boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.06)'
    },
    '.nav-glow': {
      backgroundColor: `rgb(var(${variable('action')}) / 0.22)`,
      boxShadow: `inset 0 1px 0 rgb(255 255 255 / 0.08), 0 0 24px -6px rgb(var(${variable('action')}) / 0.6)`
    },
    '.balance-bar': {
      backgroundImage: `linear-gradient(90deg, rgb(var(${variable('raised-win')})), rgb(var(${variable('raised-live')})))`
    },
    '.stage-crash': {
      position: 'relative',
      overflow: 'hidden',
      color: 'rgb(255 255 255)',
      backgroundImage: 'radial-gradient(120% 140% at 85% 20%, rgb(29 78 137) 0%, rgb(27 21 96) 45%, rgb(14 11 46) 100%)',
      boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.14), 0 40px 80px -40px rgb(34 211 238 / 0.55)'
    },
    '.stage-crash-game': {
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: 'rgb(11 10 26)',
      backgroundImage:
        'linear-gradient(rgb(255 255 255 / 0.04) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 0.04) 1px, transparent 1px), radial-gradient(130% 120% at 80% 0%, rgb(27 58 107) 0%, rgb(21 17 74) 50%, rgb(11 10 26) 100%)',
      backgroundSize: '48px 48px, 48px 48px, 100% 100%',
      boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.12), 0 30px 60px -30px rgb(34 211 238 / 0.45)'
    },
    '.glow-live-text': { textShadow: '0 6px 30px rgb(34 211 238 / 0.6)' },
    '.glow-live-text-lg': { textShadow: '0 8px 40px rgb(34 211 238 / 0.55)' },
    '.art-glow-wheel': { backgroundImage: 'radial-gradient(circle at 50% 40%, rgb(59 42 158), rgb(var(--ld-surface-1)) 75%)' },
    '.art-glow-dice': { backgroundImage: 'radial-gradient(circle at 50% 40%, rgb(14 74 92), rgb(var(--ld-surface-1)) 75%)' },
    '.art-glow-penalty': { backgroundImage: 'radial-gradient(circle at 50% 100%, rgb(47 107 30), rgb(var(--ld-surface-1)) 70%)' },
    '.art-wheel': {
      backgroundImage:
        'conic-gradient(rgb(106 72 245) 0 45deg, rgb(34 211 238) 45deg 90deg, rgb(163 230 53) 90deg 135deg, rgb(251 191 36) 135deg 180deg, rgb(106 72 245) 180deg 225deg, rgb(34 211 238) 225deg 270deg, rgb(255 107 107) 270deg 315deg, rgb(163 230 53) 315deg 360deg)',
      boxShadow: 'inset 0 0 0 8px rgb(30 28 58), inset 0 0 0 10px rgb(255 255 255 / 0.2), 0 18px 30px -10px rgb(0 0 0 / 0.8)',
      animation: 'ld-spin 14s linear infinite'
    },
    '.art-die': {
      backgroundImage: 'linear-gradient(145deg, rgb(255 255 255), rgb(207 203 255))',
      boxShadow: 'inset -6px -8px 0 rgb(79 47 217 / 0.25), 0 16px 24px -8px rgb(0 0 0 / 0.8)'
    },
    '.art-die-live': {
      backgroundImage: 'linear-gradient(145deg, rgb(103 232 249), rgb(8 145 178))',
      boxShadow: 'inset -5px -7px 0 rgb(0 0 0 / 0.18), 0 16px 24px -8px rgb(0 0 0 / 0.8)'
    },
    '.art-goal': {
      borderColor: 'rgb(244 243 255)',
      backgroundImage: 'linear-gradient(rgb(255 255 255 / 0.18) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 0.18) 1px, transparent 1px)',
      backgroundSize: '14px 14px'
    },
    '.art-ball': {
      backgroundImage: 'radial-gradient(circle at 35% 30%, rgb(255 255 255), rgb(201 198 230) 70%)',
      boxShadow: '0 10px 18px -6px rgb(0 0 0 / 0.8)'
    },
    '.ld-float': { animation: 'ld-float 4s ease-in-out infinite' },
    '@keyframes ld-spin': { to: { transform: 'rotate(360deg)' } },
    '@keyframes ld-float': {
      '0%, 100%': { transform: 'translateY(0) rotate(-8deg)' },
      '50%': { transform: 'translateY(-14px) rotate(-4deg)' }
    },
    '.tint-live': { backgroundImage: 'linear-gradient(180deg, rgb(103 232 249), rgb(34 211 238))' },
    '.tint-pending': { backgroundImage: 'linear-gradient(180deg, rgb(253 230 138), rgb(251 191 36))' },
    '.tint-win': { backgroundImage: 'linear-gradient(180deg, rgb(217 249 157), rgb(163 230 53))' },
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
