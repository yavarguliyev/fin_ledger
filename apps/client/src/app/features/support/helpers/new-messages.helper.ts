import { IncomingAfterDto } from '../interfaces/incoming-after.interface';
import { MarkerAfterOpenDto } from '../interfaces/marker-after-open.interface';
import { OwnTailDto } from '../interfaces/own-tail.interface';
import { SupportMessage } from '../../../core/types/support/support-message.type';

export class NewMessagesHelper {
  static markerAfterOpen ({ messages, unread }: MarkerAfterOpenDto): string | null {
    if (unread <= 0 || messages.length === 0) return null;
    return messages[Math.max(0, messages.length - unread)]?.id ?? null;
  }

  static ownNewTail ({ messages, previousTail, myUserId }: OwnTailDto): string | null {
    const tail = messages.at(-1);
    if (!tail || !previousTail || tail.id === previousTail || !myUserId) return null;
    return tail.senderUserId === myUserId ? tail.id : null;
  }

  static firstIncomingAfter ({ messages, afterId, myUserId }: IncomingAfterDto): string | null {
    return NewMessagesHelper.incomingAfter({ messages, afterId, myUserId })[0]?.id ?? null;
  }

  static countIncomingAfter ({ messages, afterId, myUserId }: IncomingAfterDto): number {
    return NewMessagesHelper.incomingAfter({ messages, afterId, myUserId }).length;
  }

  private static incomingAfter ({ messages, afterId, myUserId }: IncomingAfterDto): SupportMessage[] {
    if (!afterId) return [];
    const index = messages.findIndex(message => message.id === afterId);
    if (index < 0) return [];
    return messages.slice(index + 1).filter(message => message.senderUserId !== myUserId);
  }
}
