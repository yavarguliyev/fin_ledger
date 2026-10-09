import { ALBUM } from '../../constants/support/album.constant';
import { AlbumLayout } from '../../interfaces/support/album-layout.interface';
import { MessagesRefDto } from '../../interfaces/support/messages-ref.interface';
import { SupportMessage } from '../../types/support/support-message.type';

export class AlbumHelper {
  static layout ({ messages }: MessagesRefDto): AlbumLayout {
    const layout: AlbumLayout = { firsts: new Map(), members: new Set() };
    let run: SupportMessage[] = [];

    const close = (): void => {
      if (run.length >= ALBUM.MIN_ITEMS) {
        layout.firsts.set(run[0]!.id, run);
        run.slice(1).forEach(message => layout.members.add(message.id));
      }
      run = [];
    };

    for (const message of messages) {
      if (!AlbumHelper.isMedia(message)) {
        close();
        continue;
      }
      const previous = run.at(-1);
      const joins = previous && previous.senderUserId === message.senderUserId && !message.body
        && Date.parse(message.createdAt) - Date.parse(previous.createdAt) <= ALBUM.WINDOW_MS;
      if (!joins) close();
      run.push(message);
    }
    close();

    return layout;
  }

  private static isMedia (message: SupportMessage): boolean {
    if (!message.attachment || message.deletedAt || message.replyTo || message.editedAt) return false;
    if (message.kind === ALBUM.IMAGE_KIND) return true;
    return message.kind === ALBUM.VIDEO_KIND && !message.attachment.durationSeconds;
  }
}
