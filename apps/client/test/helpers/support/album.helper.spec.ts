import { AlbumHelper } from '../../../src/app/core/helpers/support/album.helper';
import { SupportMessage } from '../../../src/app/core/types/support/support-message.type';
import { CHAT_FRESHNESS_TEST as T } from '../../constants/chat-freshness.constant';
import { aSupportMessage, anAttachment } from '../../fakes/support.fake';

const media = (index: number, overrides: Partial<SupportMessage> = {}): SupportMessage =>
  aSupportMessage({
    id: `m-${index}`,
    senderUserId: T.SENDER,
    kind: T.IMAGE_KIND,
    body: null,
    attachment: anAttachment(),
    createdAt: new Date(Date.parse(T.START) + index * T.SECOND_MS).toISOString(),
    ...overrides
  });

describe('AlbumHelper', () => {
  it('groups four or more photos sent together into one album led by the first message', () => {
    const messages = [media(0, { body: T.CAPTION }), media(1), media(2), media(3), media(4)];

    const layout = AlbumHelper.layout({ messages });

    expect(layout.firsts.get('m-0')?.map(message => message.id)).toEqual(['m-0', 'm-1', 'm-2', 'm-3', 'm-4']);
    expect([...layout.members]).toEqual(['m-1', 'm-2', 'm-3', 'm-4']);
  });

  it('leaves three photos as separate bubbles, like WhatsApp', () => {
    expect(AlbumHelper.layout({ messages: [media(0), media(1), media(2)] }).firsts.size).toBe(0);
  });

  it('breaks the run on another sender, a caption, a long gap or a video note', () => {
    const gap = new Date(Date.parse(T.START) + T.BEYOND_WINDOW_MS).toISOString();
    const breakers = [
      media(1, { senderUserId: T.OTHER_SENDER }),
      media(1, { body: T.CAPTION }),
      media(1, { createdAt: gap }),
      media(1, { kind: T.VIDEO_KIND, attachment: anAttachment({ durationSeconds: 5 }) })
    ];

    for (const breaker of breakers) {
      const layout = AlbumHelper.layout({ messages: [media(0), breaker, media(2), media(3)] });
      expect(layout.firsts.size).toBe(0);
    }
  });
});
