import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  Audited,
  ENVIRONMENT_CONSTANTS,
  PaginatedResponseDto,
  ParamsQueryAndHeaders,
  RequestContext,
  Roles,
  RolesGuard,
  SessionGuard,
  UserRateLimit,
  UserRoles
} from '@common/libs';

import { BetService } from './bet.service';
import { BetDto } from './dtos/bet/bet.dto';
import { PlaceBetRequestDto, PlaceBetRequestSchema } from './dtos/request/place-bet-request.dto';
import { ListBetsRequestDto, ListBetsRequestSchema } from './dtos/request/list-bets-request.dto';
import { SettleBetDto, SettleBetSchema } from './dtos/request/settle-bet.dto';
import { SHARED_CONSTANTS } from '../../shared/constants/modules/shared.constant';

@ApiTags(SHARED_CONSTANTS.BET.key)
@UseGuards(SessionGuard, RolesGuard)
@Roles({ roles: [UserRoles.USER, UserRoles.MODERATOR, UserRoles.ADMIN, UserRoles.GLOBAL_ADMIN] })
@Controller({ path: ENVIRONMENT_CONSTANTS.RESOURCES.BET, version: ENVIRONMENT_CONSTANTS.VERSION.V1 })
export class BetController {
  constructor (private readonly betService: BetService) {}

  @Post()
  @Roles({ roles: [UserRoles.USER] })
  @UserRateLimit()
  async placeBet (@Req() req: RequestContext, @Body({ schema: PlaceBetRequestSchema }) dto: PlaceBetRequestDto): Promise<BetDto> {
    return this.betService.placeBet({ ...dto, userId: req.user.userId });
  }

  @Post(':betId/settlement')
  @Roles({ roles: [UserRoles.GLOBAL_ADMIN, UserRoles.ADMIN] })
  @Audited({ action: 'BET_SETTLED', entityType: 'Bet', entityIdParam: 'betId' })
  async settleBet (@ParamsQueryAndHeaders({ schema: SettleBetSchema }) dto: SettleBetDto): Promise<BetDto> {
    return this.betService.settleBet(dto);
  }

  @Get()
  async findBets (
    @Req() req: RequestContext,
    @ParamsQueryAndHeaders({ schema: ListBetsRequestSchema }) dto: ListBetsRequestDto
  ): Promise<PaginatedResponseDto<BetDto>> {
    return this.betService.getBets({ ...dto, userId: req.user.userId, role: req.user.role });
  }
}
