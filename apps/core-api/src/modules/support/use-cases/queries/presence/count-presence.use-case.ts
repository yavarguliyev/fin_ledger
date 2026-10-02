import { Injectable } from '@nestjs/common';

import { ListPresenceDto } from '../../../dtos/input/list-presence.dto';
import { PresenceCountDto } from '../../../dtos/presence/presence-count.dto';
import { PresenceRepository } from '../../../repositories/presence.repository';
import { SupportAccessHelper } from '../../../helpers/support-access.helper';
import { PRESENCE } from '../../../constants/presence/presence.constant';

@Injectable()
export class CountPresenceUseCase {
  constructor (private readonly presenceRepository: PresenceRepository) {}

  async execute ({ actorId, role }: ListPresenceDto): Promise<PresenceCountDto> {
    const isStaff = SupportAccessHelper.isStaff({ role });
    const counted = await this.presenceRepository.count({ staffOnly: !isStaff });
    const countsSelf = isStaff && (await this.presenceRepository.isOnline({ userId: actorId }));
    return { total: Math.max(countsSelf ? counted - PRESENCE.SELF_ENTRY : counted, PRESENCE.NO_ENTRIES) };
  }
}
