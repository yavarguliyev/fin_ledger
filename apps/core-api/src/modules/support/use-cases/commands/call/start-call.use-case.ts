import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CryptoHelper, SupportCallStatus } from '@common/libs';

import { StartCallDto } from '../../../dtos/input/start-call.dto';
import { StartCallResponseDto } from '../../../dtos/response/start-call-response.dto';
import { StoredCallDto } from '../../../dtos/call/stored-call.dto';
import { SUPPORT_CALL } from '../../../constants/call/support-call.constant';
import { SUPPORT_EVENTS } from '../../../constants/chat/support-events.constant';
import { SupportCallProvider } from '../../../providers/support-call.provider';
import { CallSessionService } from '../../../services/call-session.service';
import { SupportThreadProvider } from '../../../providers/support-thread.provider';

@Injectable()
export class StartCallUseCase {
  constructor (
    private readonly thread: SupportThreadProvider,
    private readonly sessions: CallSessionService,
    private readonly calls: SupportCallProvider
  ) {}

  async execute ({ conversationId, media, sdp, userId, role, displayName }: StartCallDto): Promise<StartCallResponseDto> {
    const conversation = await this.thread.requireOpen({ conversationId, userId, role });
    const calleeId = conversation.customerUserId === userId ? conversation.assignedStaffId : conversation.customerUserId;
    if (!calleeId) throw new NotFoundException(SUPPORT_CALL.NOT_FOUND_MESSAGE);

    if (await this.calls.isBusy({ userId })) throw new ConflictException(SUPPORT_CALL.SELF_BUSY_MESSAGE);
    if (await this.calls.isBusy({ userId: calleeId })) throw new ConflictException(SUPPORT_CALL.BUSY_MESSAGE);

    const call: StoredCallDto = {
      callId: CryptoHelper.uuid(),
      conversationId,
      callerId: userId,
      callerName: displayName,
      callerRole: role,
      calleeId,
      media,
      status: SupportCallStatus.RINGING,
      startedAt: new Date().toISOString(),
      answeredAt: null
    };

    await this.sessions.save({ call });
    this.calls.signal({ type: SUPPORT_EVENTS.CALL_INCOMING, call, fromUserId: userId, extra: { fromName: displayName, sdp } });

    return { callId: call.callId };
  }
}
