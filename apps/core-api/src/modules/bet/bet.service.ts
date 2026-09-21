import { Inject, Injectable } from '@nestjs/common';
import { Cacheable, CacheEvict, PaginatedResponseDto, REDIS_CACHE_PROVIDER, RedisCacheProvider } from '@common/libs';

import { PlaceBetUseCase } from './use-cases/commands/place-bet.use-case';
import { SettleBetUseCase } from './use-cases/commands/settle-bet.use-case';
import { GetBetsUseCase } from './use-cases/queries/get-bets.use-case';
import { BetDto } from './dtos/bet/bet.dto';
import { PlaceBetDto } from './dtos/input/place-bet.dto';
import { ListBetsDto } from './dtos/input/list-bets.dto';
import { SettleBetDto } from './dtos/request/settle-bet.dto';

@Injectable()
export class BetService {
  protected readonly [REDIS_CACHE_PROVIDER]: RedisCacheProvider;

  constructor (
    @Inject(REDIS_CACHE_PROVIDER) protected readonly redisCacheProvider: RedisCacheProvider,
    private readonly placeBetUseCase: PlaceBetUseCase,
    private readonly settleBetUseCase: SettleBetUseCase,
    private readonly getBetsUseCase: GetBetsUseCase
  ) {
    this[REDIS_CACHE_PROVIDER] = redisCacheProvider;
  }

  @CacheEvict({ keyPrefix: ['bet', 'bet:list', 'wallet'], isPattern: true })
  async placeBet (dto: PlaceBetDto): Promise<BetDto> {
    return this.placeBetUseCase.execute(dto);
  }

  @CacheEvict({ keyPrefix: ['bet', 'bet:list', 'wallet'], isPattern: true })
  async settleBet (dto: SettleBetDto): Promise<BetDto> {
    return this.settleBetUseCase.execute(dto);
  }

  @Cacheable({ keyPrefix: 'bet:list', ttlSeconds: 30 })
  async getBets (dto: ListBetsDto): Promise<PaginatedResponseDto<BetDto>> {
    return this.getBetsUseCase.execute(dto);
  }
}
