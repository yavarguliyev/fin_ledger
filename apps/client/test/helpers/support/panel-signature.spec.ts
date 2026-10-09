import { PanelPagingHelper } from '../../../src/app/core/helpers/support/panel-paging.helper';
import { CHAT_FRESHNESS_TEST as T } from '../../constants/chat-freshness.constant';
import { aSupportMessage, anAttachment } from '../../fakes/support.fake';

describe('PanelPagingHelper.sharedSignature', () => {
  const text = aSupportMessage({ id: 'text', body: T.PLAIN_BODY });
  const link = aSupportMessage({ id: 'link', body: T.LINK_BODY });
  const file = aSupportMessage({ id: 'file', body: null, attachment: anAttachment() });

  it('ignores plain text, so read receipts and chatter do not refresh the panel', () => {
    const base = PanelPagingHelper.sharedSignature({ messages: [link, file] });

    expect(PanelPagingHelper.sharedSignature({ messages: [text, link, file] })).toBe(base);
  });

  it('changes when a link or file is added or deleted', () => {
    const base = PanelPagingHelper.sharedSignature({ messages: [link] });

    expect(PanelPagingHelper.sharedSignature({ messages: [link, file] })).not.toBe(base);
    expect(PanelPagingHelper.sharedSignature({ messages: [{ ...link, deletedAt: T.DELETED_AT }] })).not.toBe(base);
  });
});
