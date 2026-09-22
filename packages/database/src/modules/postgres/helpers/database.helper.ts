import { DatabaseError, types } from 'pg';
import { ApplicationError, InfrastructureError } from '@common/shared-libs';

import { TRANSLATIONS } from '../../constants/errors/database-error.constant';
import { BuildSetClause } from '../../interfaces/build-set-clause.interface';
import { BuildSetClauseInputDto } from '../../dtos/helper/build-set-clause.dto';
import { BuildReturningClauseDto } from '../../dtos/helper/build-returning-clause.dto';
import { DatabaseErrorInputDto } from '../../dtos/helper/database-error.dto';
import { UpdatedAtClauseDto } from '../../dtos/helper/updated-at-clause.dto';

export class DatabaseHelper {
  private static readonly INT8_OID = 20;
  private static registered = false;
  private static readonly RETRYABLE_CODES = new Set(['40001', '40P01', '55P03', '57014', '08000', '08003', '08006', '08001', '08004']);
  private static readonly isDatabaseError = ({ error }: DatabaseErrorInputDto): boolean => error instanceof DatabaseError;

  static isRetryableDatabaseError ({ error }: DatabaseErrorInputDto): boolean {
    if (error instanceof InfrastructureError) return error.retryable;
    if (error instanceof DatabaseError && error.code) return this.RETRYABLE_CODES.has(error.code);
    return false;
  }

  static translateDatabaseError ({ error }: DatabaseErrorInputDto): unknown {
    if (!this.isDatabaseError({ error }) || !(error instanceof DatabaseError) || !error.code) return error;

    if (this.RETRYABLE_CODES.has(error.code)) {
      return new InfrastructureError({ message: `Database is temporarily unavailable (${error.code})`, code: 'DATABASE_UNAVAILABLE', retryable: true, httpStatus: 503 });
    }

    const translation = TRANSLATIONS[error.code];
    if (!translation) return error;

    return new ApplicationError({ message: translation.message, code: translation.code, statusCode: translation.status, cause: error });
  }

  static registerPostgresTypeParsers (): void {
    if (this.registered) return;

    this.registered = true;

    types.setTypeParser(this.INT8_OID, (value: string): number => {
      const parsed = Number(value);

      if (!Number.isSafeInteger(parsed)) {
        throw new RangeError(`Value ${value} exceeds the safe integer range and cannot be read without losing precision`);
      }

      return parsed;
    });
  }

  static buildSetClause<T> ({ builder, data }: BuildSetClauseInputDto<T>): BuildSetClause {
    const columns = Object.keys(data).filter(key => data[key] !== undefined);
    const params: unknown[] = [];

    let paramIndex = 1;

    const setClause = columns
      .map(column => {
        const dbColumn = builder.getColumnMapping({ column });
        params.push(data[column]);
        return `${dbColumn} = $${paramIndex++}`;
      })
      .join(', ');

    return { setClause, params, paramIndex };
  }

  static buildReturningClause<T> ({ builder, selectColumns }: BuildReturningClauseDto<T>): string {
    if (!selectColumns.length) return '';

    const mapped = selectColumns
      .map(column => builder.getColumnMapping({ column }))
      .map((column, index) => `${column} AS "${selectColumns[index]}"`)
      .join(', ');

    return `RETURNING ${mapped}`;
  }

  static buildUpdatedAtClause<T> ({ builder }: UpdatedAtClauseDto<T>): string {
    return builder.hasColumn({ column: 'updatedAt' }) ? `, ${builder.getColumnMapping({ column: 'updatedAt' })} = CURRENT_TIMESTAMP` : '';
  }
}
