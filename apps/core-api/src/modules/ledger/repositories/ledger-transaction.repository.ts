import { Injectable } from '@nestjs/common';
import { BaseRepository, PostgresService } from '@common/libs';

import { LedgerTransactionRecordDto } from '../dtos/transaction/ledger-transaction-record.dto';
import { CreateLedgerTransactionRecordDto } from '../dtos/repository/create-ledger-transaction-record.dto';
import { FindLedgerTransactionByIdempotencyKeyDto } from '../dtos/repository/find-ledger-transaction-by-idempotency-key.dto';

@Injectable()
export class LedgerTransactionRepository extends BaseRepository<LedgerTransactionRecordDto> {
  constructor (postgresService: PostgresService) {
    super({
      service: postgresService,
      tableName: 'ledger_transactions',
      columnMappings: {
        referenceType: 'reference_type',
        referenceId: 'reference_id',
        idempotencyKey: 'idempotency_key',
        actorUserId: 'actor_user_id',
        effectiveAt: 'effective_at',
        createdAt: 'created_at'
      }
    });
  }

  protected getSelectColumns (): string[] {
    return ['id', 'referenceType', 'referenceId', 'description', 'idempotencyKey', 'actorUserId', 'effectiveAt', 'createdAt'];
  }

  async createTransaction (dto: CreateLedgerTransactionRecordDto): Promise<LedgerTransactionRecordDto | null> {
    const { referenceType, description, idempotencyKey, referenceId, actorUserId, adapter } = dto;

    return this.create({
      data: {
        referenceType,
        description,
        idempotencyKey,
        ...(referenceId && { referenceId }),
        ...(actorUserId && { actorUserId })
      },
      adapter
    });
  }

  async findByIdempotencyKey (dto: FindLedgerTransactionByIdempotencyKeyDto): Promise<LedgerTransactionRecordDto | null> {
    const { idempotencyKey, adapter } = dto;

    return this.findOne({ where: { idempotency_key: idempotencyKey }, adapter });
  }
}
