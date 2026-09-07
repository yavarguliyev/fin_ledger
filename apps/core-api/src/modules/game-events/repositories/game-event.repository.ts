import { Injectable } from '@nestjs/common';
import { BaseExtendedRepository, GameEventStatus, PostgresService } from '@common/libs';

import { GameEventDto } from '../dtos/game-event.dto';

@Injectable()
export class GameEventRepository extends BaseExtendedRepository<GameEventDto> {
  constructor (postgresService: PostgresService) {
    super(postgresService, 'game_events', {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    });
  }

  protected getSelectColumns (): string[] {
    return ['id', 'label', 'odds', 'status', 'createdAt', 'updatedAt'];
  }

  async findByStatus (status: GameEventStatus): Promise<GameEventDto[]> {
    return this.findAll({ where: { status }, orderBy: 'created_at', orderDirection: 'DESC' });
  }

  async findAllActive (): Promise<GameEventDto[]> {
    return this.findAll({ orderBy: 'created_at', orderDirection: 'DESC' });
  }
}
