import { ConfigService } from '@nestjs/config';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { KAFKA_SERVICE, KafkaService, OutboxRepository, PasswordHandler, PostgresService, SessionData, SessionService } from '@common/libs';

import { AuthBaseUseCase } from '../base/auth-base.use-case';
import { LedgerService } from '../../../ledger/ledger.service';
import { WalletService } from '../../../wallet/wallet.service';
import { AuthRepository } from '../../repositories/auth.repository';

@Injectable()
export class ValidateSessionUseCase extends AuthBaseUseCase<string, SessionData> {
  constructor (
    protected override readonly postgresService: PostgresService,
    protected override readonly authRepository: AuthRepository,
    protected override readonly sessionService: SessionService,
    protected override readonly passwordHelper: PasswordHandler,
    protected override readonly configService: ConfigService,
    protected override readonly ledgerService: LedgerService,
    protected override readonly walletService: WalletService,
    protected override readonly outboxRepository: OutboxRepository,
    @Inject(KAFKA_SERVICE) kafkaService: KafkaService
  ) {
    super(
      postgresService,
      authRepository,
      sessionService,
      passwordHelper,
      configService,
      ledgerService,
      walletService,
      outboxRepository,
      kafkaService
    );
  }

  async execute (authorization?: string): Promise<SessionData> {
    const session = await this.sessionService.getSession(this.extractBearerToken(authorization));
    if (!session) throw new UnauthorizedException('Invalid or expired session');
    return session;
  }
}
