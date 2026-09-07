import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  EmailTemplateType,
  EXTRACT_ID_KEY,
  KAFKA_SERVICE,
  KafkaPublish,
  KafkaService,
  OutboxRepository,
  PasswordHandler,
  PostgresService,
  SendEmailDto,
  SessionService
} from '@common/libs';

import { AuthRepository } from '../../repositories/auth.repository';
import { LedgerService } from '../../../ledger/ledger.service';
import { WalletService } from '../../../wallet/wallet.service';

@Injectable()
export abstract class AuthBaseUseCase<TInput, TOutput> {
  protected readonly privateKey: string;
  protected readonly publicKey: string;
  protected readonly issuer: string;
  protected readonly frontendUrl: string;
  protected readonly [KAFKA_SERVICE]: KafkaService;

  constructor (
    protected readonly postgresService: PostgresService,
    protected readonly authRepository: AuthRepository,
    protected readonly sessionService: SessionService,
    protected readonly passwordHelper: PasswordHandler,
    protected readonly configService: ConfigService,
    protected readonly ledgerService: LedgerService,
    protected readonly walletService: WalletService,
    protected readonly outboxRepository: OutboxRepository,
    @Inject(KAFKA_SERVICE) kafkaService: KafkaService
  ) {
    this[KAFKA_SERVICE] = kafkaService;
    this.privateKey = this.configService.get<string>('JWT_PRIVATE_KEY')!.replace(/\\n/g, '\n');
    this.publicKey = this.configService.get<string>('JWT_PUBLIC_KEY')!.replace(/\\n/g, '\n');
    this.issuer = this.configService.get<string>('JWT_ISSUER')!;
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL')!;
  }

  protected abstract execute(input: TInput): Promise<TOutput>;

  @KafkaPublish({ topic: EmailTemplateType.PASSWORD_RESET, key: (result: unknown) => EXTRACT_ID_KEY(result, 'userId') })
  protected async publishPasswordReset (eventPayload: SendEmailDto): Promise<SendEmailDto> {
    return Promise.resolve(eventPayload);
  }

  protected extractBearerToken (authorization?: string): string {
    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authorization.slice(7).trim();
    if (!token) {
      throw new UnauthorizedException('Missing session token');
    }

    return token;
  }
}
