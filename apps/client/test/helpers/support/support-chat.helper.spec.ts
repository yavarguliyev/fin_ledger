import { CHAT_FAILURE } from '../../constants/chat-failure.constant';
import { HttpRequestError } from '../../../src/app/core/errors/http-request.error';
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

  it('explains a 429 instead of showing a generic failure', () => {
    const throttled = new HttpRequestError({ message: CHAT_FAILURE.THROTTLED, status: CHAT_FAILURE.TOO_MANY });
    const broken = new HttpRequestError({ message: CHAT_FAILURE.BROKEN, status: CHAT_FAILURE.SERVER_ERROR });

    expect(SupportChatHelper.failureMessage({ error: throttled, fallback: CHAT_FAILURE.FALLBACK })).toBe(CHAT_FAILURE.TOO_FAST);
    expect(SupportChatHelper.failureMessage({ error: broken, fallback: CHAT_FAILURE.FALLBACK })).toBe(CHAT_FAILURE.FALLBACK);
  });
});
