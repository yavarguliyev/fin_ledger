import { Injectable } from '@nestjs/common';

import { PresenceHelper } from '../../../helpers/presence.helper';
import { PresenceRepository } from '../../../repositories/presence.repository';
import { SUPPORT_EVENTS } from '../../../constants/chat/support-events.constant';
import { SupportStreamProvider } from '../../../providers/support-stream.provider';

@Injectable()
export class SweepPresenceUseCase {
  constructor (
    private readonly presenceRepository: PresenceRepository,
    private readonly stream: SupportStreamProvider
  ) {}

  async execute (): Promise<number> {
    if (!(await this.presenceRepository.claimSweep())) return 0;

    const expired = await this.presenceRepository.expire();
    for (const status of expired) this.stream.broadcast({ type: SUPPORT_EVENTS.PRESENCE_CHANGED, presence: PresenceHelper.offline(status) });

    return expired.length;
  }
}
