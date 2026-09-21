import { Inject, Injectable } from '@nestjs/common';
import { Cacheable, REDIS_CACHE_PROVIDER, RedisCacheProvider } from '@common/libs';

import { GetGameEventsUseCase } from './use-cases/queries/get-game-events.use-case';
import { GameEventDto } from './dtos/game-event/game-event.dto';
import { ListGameEventsDto } from './dtos/request/list-game-events.dto';

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
  async getGameEvents (dto: ListGameEventsDto): Promise<GameEventDto[]> {
    return this.getGameEventsUseCase.execute(dto);
  }
}
