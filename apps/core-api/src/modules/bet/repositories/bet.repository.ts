import { Injectable } from '@nestjs/common';
import { BaseExtendedRepository, BetStatus, PostgresService, UnknownRecord } from '@common/libs';

import { BetDto } from '../dtos/bet/bet.dto';
import { CreateBetDto } from '../dtos/repository/create-bet.dto';
import { FindBetByIdempotencyKeyDto } from '../dtos/repository/find-bet-by-idempotency-key.dto';
import { FindBetsDto } from '../dtos/repository/find-bets.dto';
import { SettleBetRecordDto } from '../dtos/repository/settle-bet-record.dto';

const buildWhere = ({ userId, status }: FindBetsDto): UnknownRecord => ({
  ...(userId && { user_id: userId }),
  ...(status && { status })
});

@Injectable()
export class BetRepository extends BaseExtendedRepository<BetDto> {
  constructor (postgresService: PostgresService) {
    super({
      service: postgresService,
      tableName: 'bets',
      columnMappings: {
        userId: 'user_id',
        walletId: 'wallet_id',
        eventId: 'event_id',
        stakeMinor: 'stake_minor',
        oddsAtPlacement: 'odds_at_placement',
        potentialPayoutMinor: 'potential_payout_minor',
        payoutMinor: 'payout_minor',
        idempotencyKey: 'idempotency_key',
        stakeLedgerTransactionId: 'stake_ledger_transaction_id',
        settlementLedgerTransactionId: 'settlement_ledger_transaction_id',
        placedAt: 'placed_at',
        settledAt: 'settled_at',
        createdAt: 'created_at',
        updatedAt: 'updated_at'
      }
    });
  }

  protected getSelectColumns (): string[] {
    return [
      'id',
      'userId',
      'walletId',
      'eventId',
      'currency',
      'selection',
      'stakeMinor',
      'oddsAtPlacement',
      'potentialPayoutMinor',
      'status',
      'payoutMinor',
      'idempotencyKey',
      'stakeLedgerTransactionId',
      'settlementLedgerTransactionId',
      'placedAt',
      'settledAt',
      'createdAt',
      'updatedAt'
    ];
  }

  async createBet (dto: CreateBetDto): Promise<BetDto | null> {
    const { adapter, ...bet } = dto;

    return this.create({ data: { ...bet, status: BetStatus.PENDING }, adapter });
  }

  async findByUserAndIdempotencyKey (dto: FindBetByIdempotencyKeyDto): Promise<BetDto | null> {
    return this.findOne({ where: { user_id: dto.userId, idempotency_key: dto.idempotencyKey } });
  }

  async settle (dto: SettleBetRecordDto): Promise<BetDto | null> {
    const { betId, adapter, ...record } = dto;

    return this.update({ id: betId, data: record, adapter });
  }

  async findPaginated (dto: FindBetsDto): Promise<BetDto[]> {
    const { limit, offset } = dto;

    return this.findAll({ where: buildWhere(dto), orderBy: 'placed_at', orderDirection: 'DESC', limit, offset });
  }

  async countBets (dto: FindBetsDto): Promise<number> {
    return this.count({ where: buildWhere(dto) });
  }
}
