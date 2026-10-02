import { SupportReplyContract } from '@common/contracts';

import { MessageRowRefDto } from '../dtos/message/message-row-ref.dto';
import { ReplyTargetDto } from '../dtos/message/reply-target.dto';
import { SupportMessageDto } from '../dtos/message/support-message.dto';

export class SupportReplyHelper {
  static fromRow ({ row }: MessageRowRefDto): SupportReplyContract | undefined {
    if (!row.replyToMessageId || !row.replyToKind) return undefined;

    return {
      id: row.replyToMessageId,
      senderUserId: row.replyToSenderUserId ?? null,
      senderName: row.replyToSenderName ?? null,
      body: row.replyToBody ?? null,
      kind: row.replyToKind,
      deleted: row.replyToDeleted ?? false
    };
  }

  static withTarget ({ row, target }: ReplyTargetDto): SupportMessageDto {
    return {
      ...row,
      replyToSenderUserId: target.senderUserId,
      replyToBody: target.deletedAt ? null : target.body,
      replyToKind: target.kind,
      replyToDeleted: !!target.deletedAt
    };
  }
}
