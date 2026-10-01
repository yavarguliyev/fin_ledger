import { MessageRulesHelper } from '../../../src/app/core/helpers/support/message-rules.helper';
import { MESSAGE_RULES_TEST } from '../../constants/message-rules.constant';
import { SupportMessage } from '../../../src/app/core/types/support/support-message.type';

const sentAgo = (ms: number): SupportMessage => ({
  id: 'm-1',
  conversationId: 'c-1',
  senderUserId: MESSAGE_RULES_TEST.OWNER,
  senderName: null,
  senderIsStaff: false,
  kind: MESSAGE_RULES_TEST.KIND,
  source: MESSAGE_RULES_TEST.SOURCE,
  body: MESSAGE_RULES_TEST.TEXT,
  attachment: null,
  editedAt: null,
  deletedAt: null,
  createdAt: new Date(Date.now() - ms).toISOString()
});

describe('MessageRulesHelper', () => {
  const fresh = sentAgo(MESSAGE_RULES_TEST.FRESH_MINUTES * MESSAGE_RULES_TEST.MINUTE_MS);
  const stale = sentAgo(MESSAGE_RULES_TEST.STALE_MINUTES * MESSAGE_RULES_TEST.MINUTE_MS);

  it('lets the sender edit for 15 minutes and nobody else ever', () => {
    expect(MessageRulesHelper.canEdit({ message: fresh, userId: MESSAGE_RULES_TEST.OWNER })).toBe(true);
    expect(MessageRulesHelper.canEdit({ message: stale, userId: MESSAGE_RULES_TEST.OWNER })).toBe(false);
    expect(MessageRulesHelper.canEdit({ message: fresh, userId: MESSAGE_RULES_TEST.OTHER })).toBe(false);
  });

  it('offers delete for everyone to the sender for 48 hours', () => {
    const recent = sentAgo(MESSAGE_RULES_TEST.RECENT_HOURS * MESSAGE_RULES_TEST.HOUR_MS);
    const old = sentAgo(MESSAGE_RULES_TEST.OLD_HOURS * MESSAGE_RULES_TEST.HOUR_MS);

    expect(MessageRulesHelper.canDeleteForEveryone({ message: recent, userId: MESSAGE_RULES_TEST.OWNER })).toBe(true);
    expect(MessageRulesHelper.canDeleteForEveryone({ message: old, userId: MESSAGE_RULES_TEST.OWNER })).toBe(false);
    expect(MessageRulesHelper.canDeleteForEveryone({ message: recent, userId: MESSAGE_RULES_TEST.OTHER })).toBe(false);
  });

  it('turns a deleted message into an empty tombstone that can no longer be edited', () => {
    const tombstone = MessageRulesHelper.tombstone({ message: fresh });

    expect(tombstone.body).toBeNull();
    expect(tombstone.attachment).toBeNull();
    expect(MessageRulesHelper.canEdit({ message: tombstone, userId: MESSAGE_RULES_TEST.OWNER })).toBe(false);
  });
});
