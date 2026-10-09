export const PENDING_UPLOAD = {
  LOCAL_PREFIX: 'upload-',
  IMAGE_PREFIX: 'image/',
  VIDEO_PREFIX: 'video/',
  KINDS: { IMAGE: 'image', VIDEO: 'video', FILE: 'file' },
  RING_SIZE: 52,
  RING_RADIUS: 22,
  RING_STROKE: 3,
  PERCENT_MAX: 100,
  ALBUM_LIMIT: 4,
  CANCEL_LABEL: 'Cancel upload',
  SENDING_LABEL: 'Sending',
  MORE_PREFIX: '+'
} as const;
