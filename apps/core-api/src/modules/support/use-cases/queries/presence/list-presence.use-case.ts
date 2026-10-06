import { Injectable } from '@nestjs/common';

import { ListPresenceDto } from '../../../dtos/input/list-presence.dto';
import { PresenceEntryDto } from '../../../dtos/presence/presence-entry.dto';
import { PresenceService } from '../../../services/presence.service';
import { SupportAccessHelper } from '../../../helpers/support-access.helper';
import { PresenceHelper } from '../../../helpers/presence.helper';

@Injectable()
export class ListPresenceUseCase {
  constructor (private readonly presence: PresenceService) {}

  async execute ({ actorId, role }: ListPresenceDto): Promise<PresenceEntryDto[]> {
    const isStaff = SupportAccessHelper.isStaff({ role });
    const userIds = await this.presence.onlineIds({ staffOnly: !isStaff });
    const stored = await this.presence.entries({ userIds });
    const listed = stored.filter(entry => !!entry).map(entry => PresenceHelper.toEntry({ entry }));
    const visible = isStaff ? listed : listed.filter(entry => SupportAccessHelper.isStaff({ role: entry.role }));
    return visible.filter(entry => entry.userId !== actorId);
  }
}
