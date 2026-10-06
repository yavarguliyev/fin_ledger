import { SupportMessageKind } from '@common/libs';

export const SUPPORT_PANEL = {
  MEDIA_KINDS: [SupportMessageKind.IMAGE, SupportMessageKind.VIDEO],
  DOC_KINDS: [SupportMessageKind.FILE, SupportMessageKind.VOICE],
  PAGE_SIZE: 30,
  STORAGE_LIST_LIMIT: 100,
  BULK_DELETE_MAX: 50,
  SUPPORT_TEAM_NAME: 'Support team',
  CONTACT_NOT_FOUND_MESSAGE: 'Contact not found',
  EMPTY_TOTALS: { totalBytes: 0, ownBytes: 0, fileCount: 0 },
  NO_BYTES: 0
} as const;
