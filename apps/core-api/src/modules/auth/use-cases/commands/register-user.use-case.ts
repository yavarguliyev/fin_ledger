import { ConflictException, Injectable } from '@nestjs/common';
import { AuthTokenPurpose, PostgresService, OutboxRepository, SessionHelper } from '@common/libs';

import { AuthRepository } from '../../repositories/auth.repository';
import { AuthTokenRepository } from '../../repositories/auth-token.repository';
import { RegisterDto } from '../../dtos/request/register.dto';
import { LedgerService } from '../../../ledger/ledger.service';
import { WalletService } from '../../../wallet/wallet.service';
import { RegisterResponseDto } from '../../dtos/response/register-response.dto';
import { AuthBaseUseCase } from '../base/auth-base.use-case';
import { AuthHelper } from '../../helpers/auth.helper';
import { AuthTokenHelper } from '../../helpers/auth-token.helper';
import { EmailHelper } from '../../../email/helpers/email.helper';

@Injectable()
export class RegisterUserUseCase extends AuthBaseUseCase<RegisterDto, RegisterResponseDto> {
  constructor (
    private readonly postgresService: PostgresService,
    private readonly authRepository: AuthRepository,
    private readonly authTokenRepository: AuthTokenRepository,
    private readonly ledgerService: LedgerService,
    private readonly walletService: WalletService,
    private readonly outboxRepository: OutboxRepository
  ) {
    super();
  }

  async execute (dto: RegisterDto): Promise<RegisterResponseDto> {
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

    const token = await AuthTokenHelper.issue({ authTokenRepository: this.authTokenRepository, userId: user.id, purpose: AuthTokenPurpose.EMAIL_VERIFICATION });
    const verificationUrl = `${this.frontendUrl}/auth/verify-email?token=${token}`;

    await EmailHelper.emitKafkaUserEmailVerification({
      to: user.email,
      subject: 'Verify Your Email',
      purpose: 'Email Verification',
      title: `Welcome ${user.displayName}!`,
      body: 'Click the link below to verify your email. This link will expire in 24 hours.',
      url: verificationUrl,
      action: 'email',
      publishEmailVerification: this.publishEmailVerification.bind(this)
    });

    return { success: true, message: 'Account created. Check your email for a link to verify your address.' };
  }
}
