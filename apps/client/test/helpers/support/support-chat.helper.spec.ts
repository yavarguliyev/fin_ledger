import { SupportChatHelper } from '../../../src/app/core/helpers/support/support-chat.helper';
import { SupportMessage } from '../../../src/app/core/types/support/support-message.type';
import { SUPPORT_ATTACHMENT_TEST } from '../../constants/support-attachment.constant';

const original: SupportMessage = { ...SUPPORT_ATTACHMENT_TEST.MESSAGE };

describe('SupportChatHelper.upsertMessage', () => {
  it('replaces an edited message in place without losing its blue ticks', () => {
    const edited: SupportMessage = { ...original, body: SUPPORT_ATTACHMENT_TEST.EDITED_BODY, editedAt: SUPPORT_ATTACHMENT_TEST.EDITED_AT, seen: false };

    const [updated] = SupportChatHelper.upsertMessage({ current: [original], incoming: edited });

    expect(updated?.body).toBe(SUPPORT_ATTACHMENT_TEST.EDITED_BODY);
    expect(updated?.editedAt).toBe(SUPPORT_ATTACHMENT_TEST.EDITED_AT);
    expect(updated?.seen).toBe(true);
  });

  it('appends a message it has not seen before', () => {
    expect(SupportChatHelper.upsertMessage({ current: [], incoming: original })).toHaveLength(1);
  });
});
