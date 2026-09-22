import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ENVIRONMENT_CONSTANTS, ParamsQueryAndHeaders, SessionGuard } from '@common/libs';

import { GameEventsService } from './game-events.service';
import { GameEventDto } from './dtos/game-event/game-event.dto';
import { ListGameEventsDto, ListGameEventsSchema } from './dtos/request/list-game-events.dto';
import { SHARED_CONSTANTS } from '../../shared/constants/modules/shared.constant';

@ApiTags(SHARED_CONSTANTS.GAME_EVENTS.key)
@UseGuards(SessionGuard)
@Controller({ path: ENVIRONMENT_CONSTANTS.RESOURCES.GAME_EVENTS, version: ENVIRONMENT_CONSTANTS.VERSION.V1 })
export class GameEventsController {
  constructor (private readonly gameEventsService: GameEventsService) {}

  @Get()
  async findGameEvents (@ParamsQueryAndHeaders({ schema: ListGameEventsSchema }) dto: ListGameEventsDto): Promise<GameEventDto[]> {
    return this.gameEventsService.getGameEvents(dto);
  }
}
