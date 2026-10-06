import { Injectable } from '@nestjs/common';

import { PresenceHelper } from '../helpers/presence.helper';
import { PresenceService } from '../services/presence.service';
import { PresenceStatusDto } from '../dtos/presence/presence-status.dto';
import { UserIdsRefDto } from '../dtos/presence/user-ids-ref.dto';

@Injectable()
export class PresenceStatusProvider {
  constructor (private readonly presence: PresenceService) {}

  async statuses ({ userIds }: UserIdsRefDto): Promise<PresenceStatusDto[]> {
    const online = await this.presence.entries({ userIds });
    const lastSeen = await this.presence.lastSeenMany({ userIds });
    return PresenceHelper.statuses({ userIds, online, lastSeen });
  }
}
