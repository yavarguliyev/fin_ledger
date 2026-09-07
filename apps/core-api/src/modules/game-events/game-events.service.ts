import { Inject, Injectable } from '@nestjs/common';
import { Cacheable, GameEventStatus, REDIS_CACHE_PROVIDER, RedisCacheProvider } from '@common/libs';

import { GetGameEventsUseCase } from './use-cases/queries/get-game-events.use-case';
import { GameEventDto } from './dtos/game-event.dto';

@Injectable()
export class GameEventsService {
  protected readonly [REDIS_CACHE_PROVIDER]: RedisCacheProvider;
  constructor (
    @Inject(REDIS_CACHE_PROVIDER) protected readonly redisCacheProvider: RedisCacheProvider,
    private readonly getGameEventsUseCase: GetGameEventsUseCase
  ) {
    this[REDIS_CACHE_PROVIDER] = redisCacheProvider;
  }

  @Cacheable({ keyPrefix: 'game-events', ttlSeconds: 60 })
  async getGameEvents (status?: GameEventStatus): Promise<GameEventDto[]> {
    return this.getGameEventsUseCase.execute(status);
  }
}
