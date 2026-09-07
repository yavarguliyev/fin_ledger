import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KAFKA_SERVICE, KafkaService, OutboxRepository, PasswordHandler, PostgresService, SessionService } from '@common/libs';

import { AuthRepository } from '../../repositories/auth.repository';
import { LoginDto } from '../../dtos/login/login.dto';
import { AuthResponseDto } from '../../dtos/auth/auth-response.dto';
import { AuthBaseUseCase } from '../base/auth-base.use-case';
import { createSessionResponse } from '../../helpers/session-response.helper';
import { SessionUserDto } from '../../dtos/auth/session-user.dto';
import { LedgerService } from '../../../ledger/ledger.service';
import { WalletService } from '../../../wallet/wallet.service';

@Injectable()
export class LoginUseCase extends AuthBaseUseCase<LoginDto, AuthResponseDto> {
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

  async execute (dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.authRepository.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    await this.passwordHelper.compare(dto.password, user.passwordHash);
    await this.authRepository.update(user.id, { lastLogin: new Date().toISOString() });

    return createSessionResponse({
      dto: user as SessionUserDto,
      sessionService: this.sessionService,
      configService: this.configService,
      isAuth: true
    }) as unknown as AuthResponseDto;
  }
}
