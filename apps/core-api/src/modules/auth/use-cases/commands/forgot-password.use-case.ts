import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { KAFKA_SERVICE, KafkaService, OutboxRepository, PasswordHandler, PostgresService, SessionService } from '@common/libs';

import { AuthBaseUseCase } from '../base/auth-base.use-case';
import { ForgotPasswordResponse } from '../../dtos/auth/forgot-password-response.dto';
import { AuthRepository } from '../../repositories/auth.repository';
import { emitKafkaPasswordReset } from '../../../email/helpers/user/emit-kafka-password-reset.helper';
import { LedgerService } from '../../../ledger/ledger.service';
import { WalletService } from '../../../wallet/wallet.service';

@Injectable()
export class ForgotPasswordUseCase extends AuthBaseUseCase<string, ForgotPasswordResponse> {
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

  async execute (email: string): Promise<ForgotPasswordResponse> {
    const user = await this.authRepository.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const tokenPayload = { userId: user.id, email: user.email, purpose: 'password_reset' };
    const token = jwt.sign(tokenPayload, this.privateKey, { algorithm: 'RS256', expiresIn: '15m', ...(this.issuer && { issuer: this.issuer }) });
    const resetUrl = `${this.frontendUrl}/auth/reset-password?token=${token}`;

    await emitKafkaPasswordReset({
      subject: 'Reset Your Password',
      purpose: 'Password Reset',
      title: 'Password Reset Request',
      body: `Click the link below to reset your password. This link will expire in 15 minutes.`,
      url: resetUrl,
      action: 'password_reset',
      publishPasswordReset: this.publishPasswordReset.bind(this)
    });

    return { status: true, message: 'Password reset email sent successfully.', token };
  }
}
