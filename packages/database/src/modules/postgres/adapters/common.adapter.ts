import { InternalServerErrorException } from '@nestjs/common';

import { QueryRowsDto } from '../../dtos/adapter/query-rows.dto';

export abstract class CommonAdapter {
  protected abstract connect(): Promise<void>;
  protected abstract disconnect(): Promise<void>;

  protected validateQueryResult<T> ({ rows }: QueryRowsDto): T[] {
    if (!Array.isArray(rows)) throw new InternalServerErrorException('Invalid query result: expected array of rows');
    return rows as T[];
  }
}
