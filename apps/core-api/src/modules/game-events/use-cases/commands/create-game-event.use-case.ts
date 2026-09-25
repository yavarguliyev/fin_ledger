import { ConflictException, Injectable } from '@nestjs/common';
import { GameEventStatus } from '@common/libs';

import { GameEventRepository } from '../../repositories/game-event.repository';
import { CreateGameEventDto } from '../../dtos/input/create-game-event.dto';
import { GameEventDto } from '../../dtos/game-event/game-event.dto';

@Injectable()
export class CreateGameEventUseCase {
  constructor (private readonly gameEventRepository: GameEventRepository) {}

  async execute (dto: CreateGameEventDto): Promise<GameEventDto> {
    const created = await this.gameEventRepository.create({ data: { ...dto, odds: String(dto.odds), status: GameEventStatus.SCHEDULED } });
    if (!created) throw new ConflictException('Could not create the game event');
    return created;
  }
}
