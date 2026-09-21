import { ConflictException, Injectable } from '@nestjs/common';
import { PostgresService, OutboxRepository, SessionHelper } from '@common/libs';

import { AuthRepository } from '../../repositories/auth.repository';
import { RegisterDto } from '../../dtos/request/register.dto';
import { LedgerService } from '../../../ledger/ledger.service';
import { WalletService } from '../../../wallet/wallet.service';
import { AuthResponseDto } from '../../dtos/response/auth-response.dto';
import { AuthBaseUseCase } from '../base/auth-base.use-case';
import { AuthHelper } from '../../helpers/auth.helper';

@Injectable()
export class RegisterUserUseCase extends AuthBaseUseCase<RegisterDto, AuthResponseDto> {
  constructor (
    private readonly postgresService: PostgresService,
    private readonly authRepository: AuthRepository,
    private readonly ledgerService: LedgerService,
    private readonly walletService: WalletService,
    private readonly outboxRepository: OutboxRepository
  ) {
    super();
  }

  async execute (dto: RegisterDto): Promise<AuthResponseDto> {
    const existingUser = await this.authRepository.findByEmailAny(dto.email);
    if (existingUser) throw new ConflictException('Email already exists');

    const passwordHash = await SessionHelper.hash({ password: dto.password });

    const { user } = await this.postgresService.getWriteConnection().transaction({
      callback: async tx => {
        return AuthHelper.createUserWalletAndLedger({
          dto,
          passwordHash,
          tx,
          authRepository: this.authRepository,
          outboxRepository: this.outboxRepository,
          ledgerService: this.ledgerService,
          walletService: this.walletService
        });
      }
    });

    return AuthHelper.createSessionResponse({
      dto: user,
      sessionService: this.sessionService,
      configService: this.configService,
      isAuth: true
    });
  }
}
