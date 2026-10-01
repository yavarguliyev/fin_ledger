import { Injectable } from '@nestjs/common';

import { ListPresenceDto } from '../../../dtos/input/list-presence.dto';
import { PresenceEntryDto } from '../../../dtos/presence/presence-entry.dto';
import { PresenceRepository } from '../../../repositories/presence.repository';
import { SupportAccessHelper } from '../../../helpers/support-access.helper';

@Injectable()
export class ListPresenceUseCase {
  constructor (private readonly presenceRepository: PresenceRepository) {}

  async execute ({ actorId, role }: ListPresenceDto): Promise<PresenceEntryDto[]> {
    const everyone = await this.presenceRepository.list();
    const visible = SupportAccessHelper.isStaff({ role }) ? everyone : everyone.filter(entry => SupportAccessHelper.isStaff({ role: entry.role }));
    return visible.filter(entry => entry.userId !== actorId);
  }
}
