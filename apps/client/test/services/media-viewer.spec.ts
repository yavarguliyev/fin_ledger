import { MediaViewerService } from '../../src/app/features/support/services/media-viewer.service';
import { MediaGalleryHelper } from '../../src/app/core/helpers/support/media-gallery.helper';
import { SUPPORT_ATTACHMENT } from '../../src/app/core/constants/support/support-attachment.constant';
import { SupportMessage } from '../../src/app/core/types/support/support-message.type';
import { MEDIA_VIEWER_TEST as T } from '../constants/media-viewer.constant';
import { aSupportMessage, anAttachment } from '../fakes/support.fake';

const image = (id: string, createdAt: string): SupportMessage =>
  aSupportMessage({ id, createdAt, kind: SUPPORT_ATTACHMENT.IMAGE_KIND, attachment: anAttachment() });

const gallery = (): SupportMessage[] => [image(T.THIRD, T.LATE), image(T.FIRST, T.EARLY), image(T.SECOND, T.MIDDLE)];

describe('MediaViewerService', () => {
  it('opens on the picked item and walks the gallery in sending order', () => {
    const viewer = new MediaViewerService();
    viewer.open({ items: gallery(), messageId: T.SECOND });

    expect(viewer.current()?.id).toBe(T.SECOND);
    viewer.next();
    expect(viewer.current()?.id).toBe(T.THIRD);
    expect(viewer.hasNext()).toBe(false);
    viewer.previous();
    viewer.previous();
    expect(viewer.current()?.id).toBe(T.FIRST);
    expect(viewer.hasPrevious()).toBe(false);
  });

  it('stays at the ends instead of wrapping around', () => {
    const viewer = new MediaViewerService();
    viewer.open({ items: gallery(), messageId: T.FIRST });
    viewer.previous();

    expect(viewer.current()?.id).toBe(T.FIRST);
  });

  it('ignores an item that is not in the gallery and closes cleanly', () => {
    const viewer = new MediaViewerService();
    viewer.open({ items: gallery(), messageId: T.MISSING });
    expect(viewer.current()).toBeNull();

    viewer.open({ items: gallery(), messageId: T.FIRST });
    viewer.close();
    expect(viewer.current()).toBeNull();
  });
});

describe('MediaGalleryHelper.items', () => {
  it('keeps photos and videos but not video notes, documents or deleted media', () => {
    const messages = [
      image(T.FIRST, T.EARLY),
      aSupportMessage({ id: T.SECOND, kind: SUPPORT_ATTACHMENT.VIDEO_KIND, attachment: anAttachment() }),
      aSupportMessage({ id: T.NOTE, kind: SUPPORT_ATTACHMENT.VIDEO_KIND, attachment: anAttachment({ durationSeconds: T.NOTE_SECONDS }) }),
      aSupportMessage({ id: T.DOCUMENT, kind: T.FILE_KIND, attachment: anAttachment() }),
      aSupportMessage({ id: T.DELETED, kind: SUPPORT_ATTACHMENT.IMAGE_KIND, attachment: anAttachment(), deletedAt: T.LATE })
    ];

    expect(MediaGalleryHelper.items({ messages }).map(item => item.id)).toEqual([T.FIRST, T.SECOND]);
  });
});
