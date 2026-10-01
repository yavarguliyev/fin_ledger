import { ForbiddenException, Injectable } from '@nestjs/common';
import { SupportCallStatus } from '@common/libs';

import { AnswerCallDto } from '../../../dtos/input/answer-call.dto';
import { OK_RESPONSE } from '../../../constants/response/ok-response.constant';
import { OkResponseDto } from '../../../dtos/response/ok-response.dto';
import { SUPPORT_CALL } from '../../../constants/call/support-call.constant';
import { SUPPORT_EVENTS } from '../../../constants/chat/support-events.constant';
import { SupportCallProvider } from '../../../providers/support-call.provider';
import { SupportCallRepository } from '../../../repositories/support-call.repository';

@Injectable()
export class AnswerCallUseCase {
  constructor (
    private readonly callRepository: SupportCallRepository,
    private readonly calls: SupportCallProvider
  ) {}

  async execute ({ callId, sdp, userId }: AnswerCallDto): Promise<OkResponseDto> {
    const found = await this.calls.requireParty({ callId, userId });
    if (found.calleeId !== userId) throw new ForbiddenException(SUPPORT_CALL.NOT_CALLEE_MESSAGE);

    const call = { ...found, status: SupportCallStatus.ACTIVE, answeredAt: new Date().toISOString() };
    await this.callRepository.save({ call });
    this.calls.signal({ type: SUPPORT_EVENTS.CALL_ANSWERED, call, fromUserId: userId, extra: { sdp } });

    return OK_RESPONSE;
  }
}
