import { Injectable } from '@nestjs/common';

import { OK_RESPONSE } from '../../../constants/response/ok-response.constant';
import { OkResponseDto } from '../../../dtos/response/ok-response.dto';
import { RelayCandidateDto } from '../../../dtos/input/relay-candidate.dto';
import { SUPPORT_EVENTS } from '../../../constants/chat/support-events.constant';
import { SupportCallProvider } from '../../../providers/support-call.provider';

@Injectable()
export class RelayCallCandidateUseCase {
  constructor (private readonly calls: SupportCallProvider) {}

  async execute ({ callId, candidate, userId }: RelayCandidateDto): Promise<OkResponseDto> {
    const call = await this.calls.requireParty({ callId, userId });
    this.calls.signal({ type: SUPPORT_EVENTS.CALL_CANDIDATE, call, fromUserId: userId, extra: { candidate } });

    return OK_RESPONSE;
  }
}
