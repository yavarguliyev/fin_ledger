import { Injectable } from '@nestjs/common';
import { PaginatedResponseDto } from '@common/libs';

import { PlaceBetUseCase } from './use-cases/commands/place-bet.use-case';
import { SettleBetUseCase } from './use-cases/commands/settle-bet.use-case';
import { GetBetsUseCase } from './use-cases/queries/get-bets.use-case';
import { BetDto } from './dtos/bet/bet.dto';
import { PlaceBetDto } from './dtos/input/place-bet.dto';
import { ListBetsDto } from './dtos/input/list-bets.dto';
import { SettleBetDto } from './dtos/request/settle-bet.dto';

@Injectable()
export class BetService {
  constructor (
    private readonly placeBetUseCase: PlaceBetUseCase,
    private readonly settleBetUseCase: SettleBetUseCase,
    private readonly getBetsUseCase: GetBetsUseCase
  ) {}

  async placeBet (dto: PlaceBetDto): Promise<BetDto> {
    return this.placeBetUseCase.execute(dto);
  }

  async settleBet (dto: SettleBetDto): Promise<BetDto> {
    return this.settleBetUseCase.execute(dto);
  }

  async getBets (dto: ListBetsDto): Promise<PaginatedResponseDto<BetDto>> {
    return this.getBetsUseCase.execute(dto);
  }
}
