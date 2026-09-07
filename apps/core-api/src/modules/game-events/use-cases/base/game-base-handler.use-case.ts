import { Injectable } from '@nestjs/common';

import { GameEventRepository } from '../../repositories/game-event.repository';

@Injectable()
export abstract class GameBaseHandlerUseCase<TInput, TOutput> {
  constructor (protected readonly gameEventRepository: GameEventRepository) {}

  protected abstract execute(input: TInput): Promise<TOutput>;
}
