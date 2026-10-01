import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { GameEventStatus } from '@common/libs';

import { ChangeGameEventStatusDto } from '../../dtos/input/change-game-event-status.dto';
import { GameEventDto } from '../../dtos/game-event/game-event.dto';
import { GAME_EVENT_TRANSITIONS } from '../../constants/status/game-event-transitions.constant';
import { GameBaseHandlerUseCase } from '../base/game-base-handler.use-case';

@Injectable()
export class ChangeGameEventStatusUseCase extends GameBaseHandlerUseCase<ChangeGameEventStatusDto, GameEventDto> {
  constructor () {
    super();
  }

  async execute ({ eventId, status }: ChangeGameEventStatusDto): Promise<GameEventDto> {
    const event = await this.gameEventRepository.findById({ id: eventId });
    if (!event) throw new NotFoundException('Game event not found');

    if (!GAME_EVENT_TRANSITIONS[event.status].includes(status)) {
      throw new ConflictException(`A ${event.status} event cannot become ${status}`);
    }

    const updated = await this.gameEventRepository.update({
      id: eventId,
      data: { status, ...(status === GameEventStatus.SETTLED && { settledAt: new Date().toISOString() }) }
    });

    if (!updated) throw new ConflictException('Could not change the game event status');

    return updated;
  }
}
