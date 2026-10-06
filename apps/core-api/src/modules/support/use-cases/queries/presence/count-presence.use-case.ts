import { Injectable } from '@nestjs/common';

import { ListPresenceDto } from '../../../dtos/input/list-presence.dto';
import { PresenceCountDto } from '../../../dtos/presence/presence-count.dto';
import { PresenceService } from '../../../services/presence.service';
import { SupportAccessHelper } from '../../../helpers/support-access.helper';
import { PRESENCE } from '../../../constants/presence/presence.constant';

@Injectable()
export class CountPresenceUseCase {
  constructor (private readonly presence: PresenceService) {}

  async execute ({ actorId, role }: ListPresenceDto): Promise<PresenceCountDto> {
    const isStaff = SupportAccessHelper.isStaff({ role });
    const counted = await this.presence.count({ staffOnly: !isStaff });
    const countsSelf = isStaff && (await this.presence.isOnline({ userId: actorId }));
    return { total: Math.max(countsSelf ? counted - PRESENCE.SELF_ENTRY : counted, PRESENCE.NO_ENTRIES) };
  }
}
