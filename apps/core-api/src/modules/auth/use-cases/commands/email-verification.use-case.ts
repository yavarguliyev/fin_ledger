import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { KAFKA_SERVICE, KafkaService, OutboxRepository, PasswordHandler, PostgresService, SessionService } from '@common/libs';

import { AuthBaseUseCase } from '../base/auth-base.use-case';
import { AuthRepository } from '../../repositories/auth.repository';
import { SessionUserDto } from '../../dtos/auth/session-user.dto';
import { createSessionResponse } from '../../helpers/session-response.helper';
import { SessionResponseDto } from '../../dtos/auth/session-response.dto';
import { EmailVerificationTokenPayload } from '../../dtos/auth/auth.dto';
import { VerifyEmailDto } from '../../dtos/auth/set-password.dto';
import { LedgerService } from '../../../ledger/ledger.service';
import { WalletService } from '../../../wallet/wallet.service';

@Injectable()
export class EmailVerificationUseCase extends AuthBaseUseCase<VerifyEmailDto, SessionResponseDto> {
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

  async execute ({ token, password }: VerifyEmailDto): Promise<SessionResponseDto> {
    const publicKey = this.configService.get<string>('JWT_PUBLIC_KEY')!.replace(/\\n/g, '\n');
    const issuer = this.configService.get<string>('JWT_ISSUER');

    const tokenPayload = jwt.verify(token, publicKey, { algorithms: ['RS256'], ...(issuer && { issuer }) }) as EmailVerificationTokenPayload;
    if (tokenPayload.purpose !== 'email_verification') throw new UnauthorizedException('Invalid token purpose');

    const user = await this.authRepository.findByEmail(tokenPayload.email);
    if (!user || user.deletedAt) throw new UnauthorizedException('User not found');
    if (user.isEmailVerified) throw new UnauthorizedException('Email already verified');

    const passwordHash = await this.passwordHelper.hash(password);
    const updatedUser = await this.authRepository.update(user.id, { isEmailVerified: true, passwordHash });
    if (!updatedUser) throw new UnauthorizedException('Failed to verify email');

    return createSessionResponse({
      dto: updatedUser as SessionUserDto,
      sessionService: this.sessionService,
      configService: this.configService,
      isAuth: true
    });
  }
}
