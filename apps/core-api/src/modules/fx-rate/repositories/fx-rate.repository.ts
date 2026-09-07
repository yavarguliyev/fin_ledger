import { Injectable } from '@nestjs/common';
import { BaseRepository, DatabaseAdapter, PostgresService } from '@common/libs';

import { FxQuoteDto } from '../dtos/quote/fx-quote.dto';
import { FxRateDto } from '../dtos/rate/fx-rate.dto';

@Injectable()
export class FxRateRepository extends BaseRepository<FxRateDto> {
  constructor (postgresService: PostgresService) {
    super(postgresService, 'fx_rates', {
      baseCurrency: 'base_currency',
      quoteCurrency: 'quote_currency',
      quotedAt: 'quoted_at',
      expiresAt: 'expires_at',
      createdAt: 'created_at'
    });
  }

  protected getSelectColumns (): string[] {
    return ['id', 'baseCurrency', 'quoteCurrency', 'rate', 'provider', 'quotedAt', 'expiresAt', 'createdAt'];
  }

  async createRate (dto: FxQuoteDto, adapter: DatabaseAdapter): Promise<FxRateDto | null> {
    return this.create(dto, undefined, adapter);
  }
}
