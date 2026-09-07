import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ENVIRONMENT_CONSTANTS, GameEventStatus, SessionGuard } from '@common/libs';

import { GameEventsService } from './game-events.service';
import { GameEventDto } from './dtos/game-event.dto';
import { SHARED_CONSTANTS } from '../../shared/constants/shared.constant';

@ApiTags(SHARED_CONSTANTS.GAME_EVENTS.key)
@UseGuards(SessionGuard)
@Controller({ path: ENVIRONMENT_CONSTANTS.RESOURCES.GAME_EVENTS, version: ENVIRONMENT_CONSTANTS.VERSION.V1 })
export class GameEventsController {
  constructor (private readonly gameEventsService: GameEventsService) {}

  @Get()
  async findGameEvents (@Query('status') status?: GameEventStatus): Promise<GameEventDto[]> {
    return this.gameEventsService.getGameEvents(status);
  }
}
