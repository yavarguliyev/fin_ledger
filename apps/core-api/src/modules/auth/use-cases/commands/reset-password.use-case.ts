import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { KAFKA_SERVICE, KafkaService, OutboxRepository, PasswordHandler, PostgresService, SessionService } from '@common/libs';

import { AuthBaseUseCase } from '../base/auth-base.use-case';
import { PasswordResetTokenPayload, ResetPasswordDto, ResetPasswordResponseDto } from '../../dtos/reset-password/reset-password.dto';
import { AuthRepository } from '../../repositories/auth.repository';
import { LedgerService } from '../../../ledger/ledger.service';
import { WalletService } from '../../../wallet/wallet.service';

@Injectable()
export class ResetPasswordUseCase extends AuthBaseUseCase<ResetPasswordDto, ResetPasswordResponseDto> {
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

  async execute (dto: ResetPasswordDto): Promise<ResetPasswordResponseDto> {
    const publicKey = this.configService.get<string>('JWT_PUBLIC_KEY')!.replace(/\\n/g, '\n');
    const issuer = this.configService.get<string>('JWT_ISSUER');

    const tokenPayload = jwt.verify(dto.token, publicKey, { algorithms: ['RS256'], ...(issuer && { issuer }) }) as PasswordResetTokenPayload;
    if (tokenPayload.purpose !== 'password_reset') throw new UnauthorizedException('Invalid token purpose');

    const user = await this.authRepository.findByEmail(tokenPayload.email);
    if (!user || user.deletedAt) throw new UnauthorizedException('User not found');

    const passwordHash = await this.passwordHelper.hash(dto.password);

    await this.authRepository.update(user.id, { passwordHash });
    await this.sessionService.deleteUserSessions(user.id);

    return { success: true, message: 'Password reset successfully. Please login with your new password.' };
  }
}
