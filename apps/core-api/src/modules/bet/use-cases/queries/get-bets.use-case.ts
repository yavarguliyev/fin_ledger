import { Injectable } from '@nestjs/common';
import { PaginatedResponseDto, STAFF_ROLES } from '@common/libs';

import { BetBaseUseCase } from '../base/bet-base.use-case';
import { BetDto } from '../../dtos/bet/bet.dto';
import { ListBetsDto } from '../../dtos/input/list-bets.dto';

@Injectable()
export class GetBetsUseCase extends BetBaseUseCase<ListBetsDto, PaginatedResponseDto<BetDto>> {
  async execute (dto: ListBetsDto): Promise<PaginatedResponseDto<BetDto>> {
    const { page, limit, status, userId, role } = dto;

    const criteria = { status, limit, offset: (page - 1) * limit, ...(role && STAFF_ROLES.includes(role) ? {} : { userId }) };

    const bets = await this.betRepository.findPaginated(criteria);
    const total = await this.betRepository.countBets(criteria);

    return new PaginatedResponseDto({ data: bets, total, page, pageSize: limit });
  }
}
