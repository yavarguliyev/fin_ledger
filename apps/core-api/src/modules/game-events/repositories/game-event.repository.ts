import { Injectable } from '@nestjs/common';
import { BaseExtendedRepository, PostgresService } from '@common/libs';

import { GameEventDto } from '../dtos/game-event/game-event.dto';
import { ListGameEventsDto } from '../dtos/request/list-game-events.dto';

@Injectable()
export class GameEventRepository extends BaseExtendedRepository<GameEventDto> {
  constructor (postgresService: PostgresService) {
    super({
      service: postgresService,
      tableName: 'game_events',
      columnMappings: {
        startsAt: 'starts_at',
        settledAt: 'settled_at',
        bettingClosesAt: 'betting_closes_at',
        createdAt: 'created_at',
        updatedAt: 'updated_at'
      }
    });
  }

  protected getSelectColumns (): string[] {
    return ['id', 'sport', 'competition', 'label', 'odds', 'status', 'result', 'startsAt', 'bettingClosesAt', 'settledAt', 'createdAt', 'updatedAt'];
  }

  async findEvents ({ status }: ListGameEventsDto): Promise<GameEventDto[]> {
    return this.findAll({ ...(status && { where: { status } }), orderBy: 'created_at', orderDirection: 'DESC' });
  }
}
