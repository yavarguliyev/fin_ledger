import { Inject, Injectable } from '@nestjs/common';
import { Cacheable, CacheEvict, REDIS_CACHE_PROVIDER, RedisCacheProvider } from '@common/libs';

import { GetGameEventsUseCase } from './use-cases/queries/get-game-events.use-case';
import { CreateGameEventUseCase } from './use-cases/commands/create-game-event.use-case';
import { ChangeGameEventStatusUseCase } from './use-cases/commands/change-game-event-status.use-case';
import { RecordGameEventResultUseCase } from './use-cases/commands/record-game-event-result.use-case';
import { GameEventDto } from './dtos/game-event/game-event.dto';
import { ListGameEventsDto } from './dtos/request/list-game-events.dto';
import { CreateGameEventDto } from './dtos/input/create-game-event.dto';
import { ChangeGameEventStatusDto } from './dtos/input/change-game-event-status.dto';
import { RecordGameEventResultDto } from './dtos/input/record-game-event-result.dto';
import { GAME_EVENTS_CACHE } from './constants/cache/game-events-cache.constant';

@Injectable()
export class GameEventsService {
  protected readonly [REDIS_CACHE_PROVIDER]: RedisCacheProvider;

  constructor (
    @Inject(REDIS_CACHE_PROVIDER) protected readonly redisCacheProvider: RedisCacheProvider,
    private readonly getGameEventsUseCase: GetGameEventsUseCase,
    private readonly createGameEventUseCase: CreateGameEventUseCase,
    private readonly changeGameEventStatusUseCase: ChangeGameEventStatusUseCase,
    private readonly recordGameEventResultUseCase: RecordGameEventResultUseCase
  ) {
    this[REDIS_CACHE_PROVIDER] = redisCacheProvider;
  }

  @Cacheable({ keyPrefix: GAME_EVENTS_CACHE.PREFIX, ttlSeconds: GAME_EVENTS_CACHE.TTL_SECONDS })
  async getGameEvents (dto: ListGameEventsDto): Promise<GameEventDto[]> {
    return this.getGameEventsUseCase.execute(dto);
  }

  @CacheEvict({ keyPrefix: [GAME_EVENTS_CACHE.PREFIX], isPattern: true })
  async createGameEvent (dto: CreateGameEventDto): Promise<GameEventDto> {
    return this.createGameEventUseCase.execute(dto);
  }

  @CacheEvict({ keyPrefix: [GAME_EVENTS_CACHE.PREFIX], isPattern: true })
  async changeStatus (dto: ChangeGameEventStatusDto): Promise<GameEventDto> {
    return this.changeGameEventStatusUseCase.execute(dto);
  }

  @CacheEvict({ keyPrefix: [GAME_EVENTS_CACHE.PREFIX], isPattern: true })
  async recordResult (dto: RecordGameEventResultDto): Promise<GameEventDto> {
    return this.recordGameEventResultUseCase.execute(dto);
  }
}
