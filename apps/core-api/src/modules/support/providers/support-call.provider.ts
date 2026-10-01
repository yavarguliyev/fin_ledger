import { Injectable, NotFoundException } from '@nestjs/common';

import { CallPartyDto } from '../dtos/input/call-party.dto';
import { CallSignalOutDto } from '../dtos/call/call-signal-out.dto';
import { StoredCallDto } from '../dtos/call/stored-call.dto';
import { SUPPORT_CALL } from '../constants/call/support-call.constant';
import { SupportCallRepository } from '../repositories/support-call.repository';
import { SupportStreamProvider } from './support-stream.provider';

@Injectable()
export class SupportCallProvider {
  constructor (
    private readonly callRepository: SupportCallRepository,
    private readonly stream: SupportStreamProvider
  ) {}

  async requireParty ({ callId, userId }: CallPartyDto): Promise<StoredCallDto> {
    const call = await this.callRepository.find({ callId });
    if (!call || (call.callerId !== userId && call.calleeId !== userId)) throw new NotFoundException(SUPPORT_CALL.NOT_FOUND_MESSAGE);

    return call;
  }

  signal ({ type, call, fromUserId, extra }: CallSignalOutDto): void {
    const targetUserId = fromUserId === call.callerId ? call.calleeId : call.callerId;
    const { callId, conversationId, media } = call;

    this.stream.broadcast({ type, targetUserId, call: { callId, conversationId, media, fromUserId, ...extra } });
  }
}
