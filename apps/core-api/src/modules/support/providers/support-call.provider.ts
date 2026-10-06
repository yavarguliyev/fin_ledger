import { Injectable, NotFoundException } from '@nestjs/common';

import { CallPartyDto } from '../dtos/input/call-party.dto';
import { CallSignalOutDto } from '../dtos/call/call-signal-out.dto';
import { StoredCallDto } from '../dtos/call/stored-call.dto';
import { SUPPORT_CALL } from '../constants/call/support-call.constant';
import { CallSessionService } from '../services/call-session.service';
import { SupportStreamProvider } from './support-stream.provider';
import { UserRefDto } from '../dtos/input/user-ref.dto';

@Injectable()
export class SupportCallProvider {
  constructor (
    private readonly sessions: CallSessionService,
    private readonly stream: SupportStreamProvider
  ) {}

  async requireParty ({ callId, userId }: CallPartyDto): Promise<StoredCallDto> {
    const call = await this.sessions.find({ callId });
    if (!call || (call.callerId !== userId && call.calleeId !== userId)) throw new NotFoundException(SUPPORT_CALL.NOT_FOUND_MESSAGE);

    return call;
  }

  async isBusy ({ userId }: UserRefDto): Promise<boolean> {
    const callId = await this.sessions.activeCallId({ userId });
    return !!callId && !!(await this.sessions.find({ callId }));
  }

  signal ({ type, call, fromUserId, extra }: CallSignalOutDto): void {
    const targetUserId = fromUserId === call.callerId ? call.calleeId : call.callerId;
    const { callId, conversationId, media } = call;

    this.stream.broadcast({ type, targetUserId, call: { callId, conversationId, media, fromUserId, ...extra } });
  }
}
