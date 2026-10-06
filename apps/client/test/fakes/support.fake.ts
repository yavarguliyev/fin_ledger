import { SupportConversation } from '../../src/app/core/types/support/support-conversation.type';
import { SupportMessage } from '../../src/app/core/types/support/support-message.type';
import type { SupportAttachmentContract as SupportAttachment } from '@common/contracts';
import { FAKES as F } from '../constants/fakes.constant';

export const aSupportMessage = (overrides: Partial<SupportMessage> = {}): SupportMessage => ({
  id: F.ID,
  conversationId: F.CONVERSATION_ID,
  senderUserId: F.USER_ID,
  senderName: F.NAME,
  senderIsStaff: false,
  kind: F.TEXT_KIND,
  source: F.WEB_SOURCE,
  body: F.BODY,
  attachment: null,
  editedAt: null,
  deletedAt: null,
  createdAt: F.CREATED_AT,
  ...overrides
});

export const aSupportConversation = (overrides: Partial<SupportConversation> = {}): SupportConversation => ({
  id: F.CONVERSATION_ID,
  customerUserId: F.USER_ID,
  customerName: F.NAME,
  assignedStaffId: F.STAFF_ID,
  assignedStaffName: F.NAME,
  subject: F.SUBJECT,
  status: F.OPEN_STATUS,
  unreadCount: 0,
  lastMessagePreview: null,
  privacyEnabled: false,
  locked: false,
  lastMessageAt: F.CREATED_AT,
  createdAt: F.CREATED_AT,
  ...overrides
});

export const anAttachment = (overrides: Partial<SupportAttachment> = {}): SupportAttachment => ({
  url: F.ATTACHMENT_URL,
  fileName: F.FILE_NAME,
  mimeType: F.MIME_TYPE,
  sizeBytes: 0,
  durationSeconds: null,
  ...overrides
});
