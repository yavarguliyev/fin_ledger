import { Injectable } from '@nestjs/common';
import { BaseRepository, PostgresService } from '@common/libs';

import { CurrencyDto } from '../dtos/currency/currency.dto';

@Injectable()
export class CurrencyRepository extends BaseRepository<CurrencyDto> {
  constructor (postgresService: PostgresService) {
    super({
      service: postgresService,
      tableName: 'currencies',
      columnMappings: {
        minorUnit: 'minor_unit',
        isActive: 'is_active'
      }
    });
  }

  protected getSelectColumns (): string[] {
    return ['code', 'name', 'minorUnit', 'isActive'];
  }

  async findActiveCodes (): Promise<string[]> {
    const currencies = await this.findAll({ where: { is_active: true }, orderBy: 'code', orderDirection: 'ASC' });

    return currencies.map(currency => currency.code);
  }
}
