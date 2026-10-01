import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Audited, ENVIRONMENT_CONSTANTS, ParamsQueryAndHeaders, Roles, RolesGuard, SessionGuard, UserRoles } from '@common/libs';

import { GameEventsService } from './game-events.service';
import { GameEventDto } from './dtos/game-event/game-event.dto';
import { ListGameEventsDto, ListGameEventsSchema } from './dtos/request/list-game-events.dto';
import { CreateGameEventDto, CreateGameEventSchema } from './dtos/input/create-game-event.dto';
import { ChangeGameEventStatusDto, ChangeGameEventStatusSchema } from './dtos/input/change-game-event-status.dto';
import { RecordGameEventResultDto, RecordGameEventResultSchema } from './dtos/input/record-game-event-result.dto';
import { SHARED_CONSTANTS } from '../../shared/constants/modules/shared.constant';

@ApiTags(SHARED_CONSTANTS.GAME_EVENTS.key)
@UseGuards(SessionGuard, RolesGuard)
@Roles({ roles: [UserRoles.GLOBAL_ADMIN, UserRoles.ADMIN, UserRoles.MODERATOR, UserRoles.USER] })
@Controller({ path: ENVIRONMENT_CONSTANTS.RESOURCES.GAME_EVENTS, version: ENVIRONMENT_CONSTANTS.VERSION.V1 })
export class GameEventsController {
  constructor (private readonly gameEventsService: GameEventsService) {}

  @Get()
  async findGameEvents (@ParamsQueryAndHeaders({ schema: ListGameEventsSchema }) dto: ListGameEventsDto): Promise<GameEventDto[]> {
    return this.gameEventsService.getGameEvents(dto);
  }

  @Post()
  @Roles({ roles: [UserRoles.GLOBAL_ADMIN, UserRoles.ADMIN] })
  @Audited({ action: 'GAME_EVENT_CREATED', entityType: 'GameEvent' })
  async createGameEvent (@Body({ schema: CreateGameEventSchema }) dto: CreateGameEventDto): Promise<GameEventDto> {
    return this.gameEventsService.createGameEvent(dto);
  }

  @Patch(':eventId/status')
  @Roles({ roles: [UserRoles.GLOBAL_ADMIN, UserRoles.ADMIN] })
  @Audited({ action: 'GAME_EVENT_STATUS_CHANGED', entityType: 'GameEvent' })
  async changeStatus (
    @Param('eventId') eventId: string,
    @Body({ schema: ChangeGameEventStatusSchema.omit({ eventId: true }) }) dto: Omit<ChangeGameEventStatusDto, 'eventId'>
  ): Promise<GameEventDto> {
    return this.gameEventsService.changeStatus({ ...dto, eventId });
  }

  @Patch(':eventId/result')
  @Roles({ roles: [UserRoles.GLOBAL_ADMIN, UserRoles.ADMIN] })
  @Audited({ action: 'GAME_EVENT_RESULT_RECORDED', entityType: 'GameEvent' })
  async recordResult (
    @Param('eventId') eventId: string,
    @Body({ schema: RecordGameEventResultSchema.omit({ eventId: true }) }) dto: Omit<RecordGameEventResultDto, 'eventId'>
  ): Promise<GameEventDto> {
    return this.gameEventsService.recordResult({ ...dto, eventId });
  }
}
