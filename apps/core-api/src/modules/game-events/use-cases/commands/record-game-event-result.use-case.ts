import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { GameEventRepository } from '../../repositories/game-event.repository';
import { RecordGameEventResultDto } from '../../dtos/input/record-game-event-result.dto';
import { GameEventDto } from '../../dtos/game-event/game-event.dto';
import { GAME_EVENT_RESULT_STATUSES } from '../../constants/status/game-event-transitions.constant';

@Injectable()
export class RecordGameEventResultUseCase {
  constructor (private readonly gameEventRepository: GameEventRepository) {}

  async execute ({ eventId, result }: RecordGameEventResultDto): Promise<GameEventDto> {
    const event = await this.gameEventRepository.findById({ id: eventId });
    if (!event) throw new NotFoundException('Game event not found');

    if (!GAME_EVENT_RESULT_STATUSES.includes(event.status)) {
      throw new ConflictException(`A result can only be recorded once the event is ${GAME_EVENT_RESULT_STATUSES.join(' or ')}`);
    }

    const updated = await this.gameEventRepository.update({ id: eventId, data: { result } });
    if (!updated) throw new ConflictException('Could not record the game event result');

    return updated;
  }
}
