import { ForbiddenException, Injectable } from '@nestjs/common';

import { LastSeenDto } from '../../../dtos/input/last-seen.dto';
import { LastSeenResponseDto } from '../../../dtos/response/last-seen-response.dto';
import { PresenceRepository } from '../../../repositories/presence.repository';
import { SUPPORT } from '../../../constants/chat/support.constant';
import { SupportAccessHelper } from '../../../helpers/support-access.helper';

@Injectable()
export class LastSeenUseCase {
  constructor (private readonly presenceRepository: PresenceRepository) {}

  async execute ({ targetUserId, role }: LastSeenDto): Promise<LastSeenResponseDto> {
    if (!SupportAccessHelper.isStaff({ role })) throw new ForbiddenException(SUPPORT.LAST_SEEN_STAFF_ONLY_MESSAGE);
    return { userId: targetUserId, lastSeenAt: await this.presenceRepository.lastSeen({ userId: targetUserId }) };
  }
}
