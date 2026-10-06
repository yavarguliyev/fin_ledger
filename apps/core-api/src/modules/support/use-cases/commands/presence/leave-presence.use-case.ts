import { Injectable } from '@nestjs/common';

import { OK_RESPONSE } from '../../../constants/response/ok-response.constant';
import { OkResponseDto } from '../../../dtos/response/ok-response.dto';
import { PresenceHelper } from '../../../helpers/presence.helper';
import { PresenceService } from '../../../services/presence.service';
import { SUPPORT_EVENTS } from '../../../constants/chat/support-events.constant';
import { SupportStreamProvider } from '../../../providers/support-stream.provider';
import { UserRefDto } from '../../../dtos/input/user-ref.dto';

@Injectable()
export class LeavePresenceUseCase {
  constructor (
    private readonly presence: PresenceService,
    private readonly stream: SupportStreamProvider
  ) {}

  async execute (dto: UserRefDto): Promise<OkResponseDto> {
    const stored = await this.presence.takeEntry(dto);
    const lastSeenAt = await this.presence.markLeft(dto);

    if (stored) {
      const presence = PresenceHelper.forContact({ contact: stored, online: false, lastSeenAt });
      this.stream.broadcast({ type: SUPPORT_EVENTS.PRESENCE_CHANGED, presence });
    }

    return OK_RESPONSE;
  }
}
