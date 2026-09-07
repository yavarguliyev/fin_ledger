import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PostgresService, OutboxRepository, SessionService, PasswordHandler, KAFKA_SERVICE, KafkaService } from '@common/libs';

import { AuthRepository } from '../../repositories/auth.repository';
import { RegisterDto } from '../../dtos/register/register.dto';
import { LedgerService } from '../../../ledger/ledger.service';
import { WalletService } from '../../../wallet/wallet.service';
import { AuthResponseDto } from '../../dtos/auth/auth-response.dto';
import { AuthBaseUseCase } from '../base/auth-base.use-case';
import { SessionUserDto } from '../../dtos/auth/session-user.dto';
import { createSessionResponse } from '../../helpers/session-response.helper';
import { createUserWalletAndLedger } from '../../helpers/create-user-wallet-and-ledger.helper';

@Injectable()
export class RegisterUserUseCase extends AuthBaseUseCase<RegisterDto, AuthResponseDto> {
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

  async execute (dto: RegisterDto): Promise<AuthResponseDto> {
    const existingUser = await this.authRepository.findByEmailForSignUp(dto.email);
    if (existingUser) throw new ConflictException('Email already exists');

    const passwordHash = await this.passwordHelper.hash(dto.password);

    const { user, walletId, ledgerAccountId } = await this.postgresService.getWriteConnection().transaction(async tx => {
      return createUserWalletAndLedger({
        dto,
        passwordHash,
        tx,
        authRepository: this.authRepository,
        outboxRepository: this.outboxRepository,
        ledgerService: this.ledgerService,
        walletService: this.walletService
      });
    });

    return createSessionResponse({
      dto: user as SessionUserDto,
      walletId,
      ledgerAccountId,
      sessionService: this.sessionService,
      configService: this.configService,
      isAuth: true
    }) as unknown as AuthResponseDto;
  }
}
