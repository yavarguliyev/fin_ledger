export const CHAT_THEME = {
  DEFAULT: 'DEFAULT',
  TITLE: 'Chat theme',
  LIST: [
    { theme: 'DEFAULT', label: 'Default' },
    { theme: 'OCEAN', label: 'Ocean' },
    { theme: 'FOREST', label: 'Forest' },
    { theme: 'SUNSET', label: 'Sunset' },
    { theme: 'LAVENDER', label: 'Lavender' },
    { theme: 'ROSE', label: 'Rose' }
  ],
  PREVIEW_IN: 'Hi, how can we help?',
  PREVIEW_OUT: 'Thanks!',
  HINT: 'The theme changes the wallpaper and message bubbles in this chat for both of you.'
} as const;
