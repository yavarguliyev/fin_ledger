import { SupportAccessHelper } from './support-access.helper';
import { SupportStreamDeliveryDto } from '../dtos/stream/support-stream-delivery.dto';
import { SupportStreamEventRefDto } from '../dtos/stream/support-stream-event-ref.dto';
import { SupportStreamPayloadDto } from '../dtos/stream/support-stream-payload.dto';

export class SupportStreamHelper {
  static isFor ({ event, userId, role }: SupportStreamDeliveryDto): boolean {
    const staff = SupportAccessHelper.isStaff({ role });

    if (event.targetUserId) return event.targetUserId === userId;
    if (event.presence) return event.presence.userId !== userId && (staff || SupportAccessHelper.isStaff({ role: event.presence.role }));
    if (event.customerUserId === userId || event.assignedStaffId === userId) return true;

    return staff && !event.assignedStaffId;
  }

  static toPayload ({ event }: SupportStreamEventRefDto): SupportStreamPayloadDto {
    const { type, conversationId, message, readerUserId, typingUserId, messageId, reactions, presence, call, privacyEnabled, pinsChanged, themeChanged } = event;

    return {
      type,
      ...(conversationId && { conversationId }),
      ...(message && { message }),
      ...(readerUserId && { readerUserId }),
      ...(typingUserId && { typingUserId }),
      ...(messageId && { messageId }),
      ...(reactions && { reactions }),
      ...(presence && { presence }),
      ...(call && { call }),
      ...(privacyEnabled !== undefined && { privacyEnabled }),
      ...(pinsChanged && { pinsChanged }),
      ...(themeChanged && { themeChanged })
    };
  }
}
