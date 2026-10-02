import { NewMessagesHelper } from '../../../src/app/features/support/helpers/new-messages.helper';
import { SupportMessage } from '../../../src/app/core/types/support/support-message.type';
import { NEW_MESSAGES_TEST as T } from '../../constants/new-messages.constant';

const message = (id: string, senderUserId: string): SupportMessage => ({ id, senderUserId }) as unknown as SupportMessage;

const messages = [message(T.FIRST, T.PEER), message(T.SECOND, T.ME), message(T.THIRD, T.PEER), message(T.FOURTH, T.PEER)];

describe('NewMessagesHelper.markerAfterOpen', () => {
  it('puts the divider before the first unread message', () => {
    expect(NewMessagesHelper.markerAfterOpen({ messages, unread: T.TWO_UNREAD })).toBe(T.THIRD);
  });

  it('shows no divider when nothing is unread', () => {
    expect(NewMessagesHelper.markerAfterOpen({ messages, unread: 0 })).toBeNull();
  });

  it('falls back to the first loaded message when more are unread than loaded', () => {
    expect(NewMessagesHelper.markerAfterOpen({ messages, unread: T.TOO_MANY_UNREAD })).toBe(T.FIRST);
  });
});

describe('NewMessagesHelper incoming messages', () => {
  it('finds the first message from someone else after the last one seen', () => {
    expect(NewMessagesHelper.firstIncomingAfter({ messages, afterId: T.FIRST, myUserId: T.ME })).toBe(T.THIRD);
  });

  it('counts only messages from others after the last one seen', () => {
    expect(NewMessagesHelper.countIncomingAfter({ messages, afterId: T.FIRST, myUserId: T.ME })).toBe(T.TWO_UNREAD);
  });

  it('counts nothing when the last seen message is unknown', () => {
    expect(NewMessagesHelper.countIncomingAfter({ messages, afterId: T.MISSING, myUserId: T.ME })).toBe(0);
    expect(NewMessagesHelper.countIncomingAfter({ messages, afterId: null, myUserId: T.ME })).toBe(0);
  });
});
