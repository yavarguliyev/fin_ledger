import { Injectable } from '@nestjs/common';

import { PresenceHelper } from '../../../helpers/presence.helper';
import { PresenceService } from '../../../services/presence.service';
import { PresenceStatusProvider } from '../../../providers/presence-status.provider';
import { SUPPORT_EVENTS } from '../../../constants/chat/support-events.constant';
import { SupportStreamProvider } from '../../../providers/support-stream.provider';

@Injectable()
export class SweepPresenceUseCase {
  constructor (
    private readonly presence: PresenceService,
    private readonly statuses: PresenceStatusProvider,
    private readonly stream: SupportStreamProvider
  ) {}

  async execute (): Promise<number> {
    if (!(await this.presence.claimSweep())) return 0;

    const cutoff = PresenceHelper.onlineCutoff();
    const stale = await this.presence.staleIds({ cutoff });
    if (stale.length === 0) return 0;

    await this.presence.trimStale({ cutoff });
    const expired = (await this.statuses.statuses({ userIds: stale })).filter(status => !status.online);
    for (const status of expired) this.stream.broadcast({ type: SUPPORT_EVENTS.PRESENCE_CHANGED, presence: PresenceHelper.offline(status) });

    return expired.length;
  }
}
