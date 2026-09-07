import { Injectable } from '@nestjs/common';
import { GameEventStatus } from '@common/libs';

import { GameEventRepository } from '../../repositories/game-event.repository';
import { GameEventDto } from '../../dtos/game-event.dto';
import { GameBaseHandlerUseCase } from '../base/game-base-handler.use-case';

@Injectable()
export class GetGameEventsUseCase extends GameBaseHandlerUseCase<GameEventStatus, GameEventDto[]> {
  constructor (protected override readonly gameEventRepository: GameEventRepository) {
    super(gameEventRepository);
  }

  async execute (status?: GameEventStatus): Promise<GameEventDto[]> {
    if (status) return this.gameEventRepository.findByStatus(status);
    return this.gameEventRepository.findAllActive();
  }
}
