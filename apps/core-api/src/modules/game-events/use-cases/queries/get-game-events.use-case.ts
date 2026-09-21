import { Injectable } from '@nestjs/common';

import { GameEventDto } from '../../dtos/game-event/game-event.dto';
import { ListGameEventsDto } from '../../dtos/request/list-game-events.dto';
import { GameBaseHandlerUseCase } from '../base/game-base-handler.use-case';

@Injectable()
export class GetGameEventsUseCase extends GameBaseHandlerUseCase<ListGameEventsDto, GameEventDto[]> {
  async execute (dto: ListGameEventsDto): Promise<GameEventDto[]> {
    return this.gameEventRepository.findEvents(dto);
  }
}
