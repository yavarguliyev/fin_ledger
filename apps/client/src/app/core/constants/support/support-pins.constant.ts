export const SUPPORT_PINS = {
  PINS_PATH: '/pins',
  PIN_PATH: '/pin',
  MESSAGES_PATH: '/messages/',
  DURATIONS: [
    { id: 'DAY', label: '24 hours' },
    { id: 'WEEK', label: '7 days' },
    { id: 'MONTH', label: '30 days' }
  ],
  PIN_FAILED: 'Could not pin that message.',
  UNPIN_FAILED: 'Could not unpin that message.',
  PIN_ACTION: 'Pin message',
  UNPIN_ACTION: 'Unpin message',
  TITLE: 'Choose how long your pin lasts',
  HINT: 'You can unpin at any time.',
  CANCEL: 'Cancel',
  BANNER_LABEL: 'Pinned message',
  PHOTO: 'Photo',
  VIDEO: 'Video',
  ATTACHMENT: 'Attachment',
  COUNTER_SEPARATOR: ' of '
} as const;
