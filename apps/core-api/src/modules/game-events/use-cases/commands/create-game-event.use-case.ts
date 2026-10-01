import { ConflictException, Injectable } from '@nestjs/common';
import { GameEventStatus } from '@common/libs';

import { CreateGameEventDto } from '../../dtos/input/create-game-event.dto';
import { GameEventDto } from '../../dtos/game-event/game-event.dto';
import { GameBaseHandlerUseCase } from '../base/game-base-handler.use-case';

@Injectable()
export class CreateGameEventUseCase extends GameBaseHandlerUseCase<CreateGameEventDto, GameEventDto> {
  constructor () {
    super();
  }

  async execute (dto: CreateGameEventDto): Promise<GameEventDto> {
    const created = await this.gameEventRepository.create({ data: { ...dto, odds: String(dto.odds), status: GameEventStatus.SCHEDULED } });
    if (!created) throw new ConflictException('Could not create the game event');
    return created;
  }
}
