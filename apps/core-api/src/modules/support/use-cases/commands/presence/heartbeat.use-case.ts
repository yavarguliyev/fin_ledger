import { Injectable } from '@nestjs/common';

import { OK_RESPONSE } from '../../../constants/response/ok-response.constant';
import { OkResponseDto } from '../../../dtos/response/ok-response.dto';
import { HeartbeatDto } from '../../../dtos/presence/heartbeat.dto';
import { PresenceHelper } from '../../../helpers/presence.helper';
import { PresenceService } from '../../../services/presence.service';
import { SUPPORT_EVENTS } from '../../../constants/chat/support-events.constant';
import { SupportStreamProvider } from '../../../providers/support-stream.provider';
import { SweepPresenceUseCase } from './sweep-presence.use-case';

@Injectable()
export class HeartbeatUseCase {
  constructor (
    private readonly presence: PresenceService,
    private readonly stream: SupportStreamProvider,
    private readonly sweepPresence: SweepPresenceUseCase
  ) {}

  async execute (dto: HeartbeatDto): Promise<OkResponseDto> {
    const wasOnline = await this.presence.isOnline(dto);
    const entry = await this.presence.touch(dto);

    if (!wasOnline) this.stream.broadcast({ type: SUPPORT_EVENTS.PRESENCE_CHANGED, presence: PresenceHelper.toEntry({ entry }) });

    await this.sweepPresence.execute();

    return OK_RESPONSE;
  }
}
