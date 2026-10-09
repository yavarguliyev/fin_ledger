export const CHAT_ROW_PREVIEW = {
  MEDIA: {
    IMAGE: { icon: 'photo', label: 'Photo' },
    VIDEO: { icon: 'video', label: 'Video' },
    VOICE: { icon: 'voice', label: 'Voice message' }
  },
  MEDIA_KINDS: ['IMAGE', 'VIDEO', 'VOICE'] as readonly string[],
  FILE_KIND: 'FILE',
  SYSTEM_KIND: 'SYSTEM',
  ICONS: { FILE: 'file', DELETED: 'deleted' },
  TICKS: { NONE: 'none', SENT: 'sent', SEEN: 'seen' },
  SEEN_LABEL: 'Read',
  SENT_LABEL: 'Delivered'
} as const;
