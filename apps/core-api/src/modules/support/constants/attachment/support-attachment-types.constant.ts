import { SupportMessageKind } from '@common/libs';

import { AttachmentType } from '../../interfaces/attachment-type.interface';

const ZIP = [{ offset: 0, bytes: [0x50, 0x4b, 0x03, 0x04] }];
const OLE = [{ offset: 0, bytes: [0xd0, 0xcf, 0x11, 0xe0] }];
const EBML = [{ offset: 0, bytes: [0x1a, 0x45, 0xdf, 0xa3] }];
const MP4 = [{ offset: 4, bytes: [0x66, 0x74, 0x79, 0x70] }];
const OGG = [{ offset: 0, bytes: [0x4f, 0x67, 0x67, 0x53] }];

export const SUPPORT_ATTACHMENT_TYPES: readonly AttachmentType[] = [
  { mime: 'image/jpeg', kind: SupportMessageKind.IMAGE, signature: [{ offset: 0, bytes: [0xff, 0xd8, 0xff] }] },
  { mime: 'image/png', kind: SupportMessageKind.IMAGE, signature: [{ offset: 0, bytes: [0x89, 0x50, 0x4e, 0x47] }] },
  { mime: 'image/gif', kind: SupportMessageKind.IMAGE, signature: [{ offset: 0, bytes: [0x47, 0x49, 0x46, 0x38] }] },
  {
    mime: 'image/webp',
    kind: SupportMessageKind.IMAGE,
    signature: [
      { offset: 0, bytes: [0x52, 0x49, 0x46, 0x46] },
      { offset: 8, bytes: [0x57, 0x45, 0x42, 0x50] }
    ]
  },
  { mime: 'application/pdf', kind: SupportMessageKind.FILE, signature: [{ offset: 0, bytes: [0x25, 0x50, 0x44, 0x46] }] },
  { mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', kind: SupportMessageKind.FILE, signature: ZIP },
  { mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', kind: SupportMessageKind.FILE, signature: ZIP },
  { mime: 'application/msword', kind: SupportMessageKind.FILE, signature: OLE },
  { mime: 'application/vnd.ms-excel', kind: SupportMessageKind.FILE, signature: OLE },
  { mime: 'text/plain', kind: SupportMessageKind.FILE, signature: [] },
  { mime: 'text/csv', kind: SupportMessageKind.FILE, signature: [] },
  { mime: 'audio/webm', kind: SupportMessageKind.VOICE, signature: EBML },
  { mime: 'audio/ogg', kind: SupportMessageKind.VOICE, signature: OGG },
  { mime: 'audio/mp4', kind: SupportMessageKind.VOICE, signature: MP4 },
  { mime: 'video/webm', kind: SupportMessageKind.VIDEO, signature: EBML },
  { mime: 'video/mp4', kind: SupportMessageKind.VIDEO, signature: MP4 }
];
