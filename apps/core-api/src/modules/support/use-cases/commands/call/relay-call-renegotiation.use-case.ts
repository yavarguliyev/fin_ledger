import { Injectable } from '@nestjs/common';

import { OK_RESPONSE } from '../../../constants/response/ok-response.constant';
import { OkResponseDto } from '../../../dtos/response/ok-response.dto';
import { RelayRenegotiationDto } from '../../../dtos/input/relay-renegotiation.dto';
import { SUPPORT_EVENTS } from '../../../constants/chat/support-events.constant';
import { SupportCallProvider } from '../../../providers/support-call.provider';

@Injectable()
export class RelayCallRenegotiationUseCase {
  constructor (private readonly calls: SupportCallProvider) {}

  async execute ({ callId, sdp, sdpType, userId }: RelayRenegotiationDto): Promise<OkResponseDto> {
    const call = await this.calls.requireParty({ callId, userId });
    this.calls.signal({ type: SUPPORT_EVENTS.CALL_RENEGOTIATE, call, fromUserId: userId, extra: { sdp, sdpType } });

    return OK_RESPONSE;
  }
}
