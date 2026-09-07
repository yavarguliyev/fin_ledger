import { InternalServerErrorException } from '@nestjs/common';

export abstract class CommonAdapter {
  protected abstract isConnected(): boolean;
  protected abstract connect(): Promise<void>;
  protected abstract disconnect(): Promise<void>;

  protected validateQueryResult<T> (rows: unknown[]): T[] {
    if (!Array.isArray(rows)) throw new InternalServerErrorException('Invalid query result: expected array of rows');
    return rows as T[];
  }
}
