import { Inject } from '@nestjs/common';

import { GameEventRepository } from '../../repositories/game-event.repository';

export abstract class GameBaseHandlerUseCase<TInput, TOutput> {
  @Inject(GameEventRepository)
  protected readonly gameEventRepository!: GameEventRepository;

  abstract execute(input: TInput): Promise<TOutput>;
}
