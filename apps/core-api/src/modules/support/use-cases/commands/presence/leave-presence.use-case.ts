import { Injectable } from '@nestjs/common';

import { OK_RESPONSE } from '../../../constants/response/ok-response.constant';
import { OkResponseDto } from '../../../dtos/response/ok-response.dto';
import { PresenceHelper } from '../../../helpers/presence.helper';
import { PresenceRepository } from '../../../repositories/presence.repository';
import { SUPPORT_EVENTS } from '../../../constants/chat/support-events.constant';
import { SupportStreamProvider } from '../../../providers/support-stream.provider';
import { UserRefDto } from '../../../dtos/input/user-ref.dto';

@Injectable()
export class LeavePresenceUseCase {
  constructor (
    private readonly presenceRepository: PresenceRepository,
    private readonly stream: SupportStreamProvider
  ) {}

  async execute (dto: UserRefDto): Promise<OkResponseDto> {
    const stored = await this.presenceRepository.leave(dto);

    if (stored) {
      const presence = PresenceHelper.forContact({ contact: stored, online: false, lastSeenAt: stored.lastSeenAt });
      this.stream.broadcast({ type: SUPPORT_EVENTS.PRESENCE_CHANGED, presence });
    }

    return OK_RESPONSE;
  }
}
