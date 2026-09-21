import { Injectable } from '@nestjs/common';

import { PostgresService } from '../services/postgres.service';
import { Builder } from '../query-builder/builder';
import { RepositoryOptionsDto } from '../../dtos/repository/repository-options.dto';
import { QueryWithAdapterDto } from '../../dtos/query/query-with-adapter.dto';
import { EntityIdRefDto } from '../../dtos/repository/entity-id-ref.dto';
import { FindOneDto } from '../../dtos/repository/find-one.dto';
import { CreateRecordDto } from '../../dtos/repository/create-record.dto';
import { UpdateRecordDto } from '../../dtos/repository/update-record.dto';
import { SoftDeleteDto } from '../../dtos/repository/soft-delete.dto';
import { AggregateByGroupDto } from '../../dtos/repository/aggregate-by-group.dto';
import { SumDto } from '../../dtos/repository/sum.dto';

@Injectable()
export abstract class BaseRepository<T> {
  protected builder: Builder<T>;

  protected readonly service: PostgresService;

  constructor ({ service, tableName, columnMappings = {} }: RepositoryOptionsDto) {
    this.service = service;
    this.builder = new Builder({ tableName, columnMappings });
  }

  protected abstract getSelectColumns(): string[];

  async findAll ({ adapter, ...options }: QueryWithAdapterDto = {}): Promise<T[]> {
    const { query, params } = this.builder.buildSelectQuery({ columns: this.getSelectColumns(), options });
    const result = await (adapter ?? this.service.getConnection()).query<T>({ sql: query, params });

    return result.rows;
  }

  async findById ({ id, adapter }: EntityIdRefDto): Promise<T | null> {
    return this.findOne({ where: { id }, ...(adapter && { adapter }) });
  }

  async findOne ({ where, adapter }: FindOneDto): Promise<T | null> {
    const { query, params } = this.builder.buildSelectQuery({ columns: this.getSelectColumns(), options: { where } });
    const result = await (adapter ?? this.service.getConnection()).query<T>({ sql: query, params });

    return (result.rows[0] as T) || null;
  }

  async create<K extends keyof T> ({ data, returningColumns, adapter }: CreateRecordDto<T, K>): Promise<Pick<T, K> | null> {
    const columnsToReturn = returningColumns ?? (this.getSelectColumns() as K[]);
    const { query, params } = this.builder.buildInsertQuery({ data, returningColumns: columnsToReturn });
    const result = await (adapter ?? this.service.getConnection()).query<Pick<T, K>>({ sql: query, params });

    return (result.rows[0] as T) ?? null;
  }

  async update<K extends keyof T> ({ id, data, returningColumns, adapter }: UpdateRecordDto<T, K>): Promise<Pick<T, K> | null> {
    const columnsToReturn = returningColumns ?? (this.getSelectColumns() as K[]);
    const { query, params } = this.builder.buildUpdateQuery({ id, data, returningColumns: columnsToReturn.map(String) });
    const result = await (adapter ?? this.service.getConnection()).query<T>({ sql: query, params });

    return (result.rows[0] as T) || null;
  }

  async delete ({ id, adapter }: EntityIdRefDto): Promise<boolean> {
    const { query, params } = this.builder.buildDeleteQuery({ id });
    const result = await (adapter ?? this.service.getConnection()).query({ sql: query, params });

    return result.rowCount > 0;
  }

  async softDelete ({ id, data, adapter }: SoftDeleteDto<T>): Promise<boolean> {
    const { query, params } = this.builder.buildUpdateQuery({ id, data, returningColumns: [] });
    const result = await (adapter ?? this.service.getConnection()).query({ sql: query, params });

    return result.rowCount > 0;
  }

  async count ({ adapter, ...options }: QueryWithAdapterDto = {}): Promise<number> {
    const { query, params } = this.builder.buildCountQuery({ options });
    const result = await (adapter ?? this.service.getConnection()).query<{ count: number }>({ sql: query, params });

    return Number(result.rows[0]?.count ?? 0);
  }

  async aggregateByGroup<R> ({ groupBy, aggregates, adapter, ...options }: AggregateByGroupDto): Promise<R[]> {
    const { query, params } = this.builder.buildGroupedAggregateQuery({ groupBy, aggregates, options });
    const result = await (adapter ?? this.service.getConnection()).query<R>({ sql: query, params });

    return result.rows;
  }

  async sum ({ column, adapter, ...options }: SumDto): Promise<number> {
    const { query, params } = this.builder.buildSumQuery({ column, options });
    const result = await (adapter ?? this.service.getConnection()).query<{ sum: string | null }>({ sql: query, params });

    return Number(result.rows[0]?.sum ?? 0);
  }
}
