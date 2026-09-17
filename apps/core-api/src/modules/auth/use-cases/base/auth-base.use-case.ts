import { Inject, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailTemplateType, EXTRACT_ID_KEY, KAFKA_SERVICE, KafkaPublish, KafkaService, SendEmailDto, SessionService } from '@common/libs';

export abstract class AuthBaseUseCase<TInput, TOutput> {
  @Inject(ConfigService)
  protected readonly configService!: ConfigService;

  @Inject(SessionService)
  protected readonly sessionService!: SessionService;

  @Inject(KAFKA_SERVICE)
  protected readonly [KAFKA_SERVICE]!: KafkaService;

  protected get privateKey (): string {
    return this.configService.get<string>('JWT_PRIVATE_KEY')!.replace(/\\n/g, '\n');
  }

  protected get publicKey (): string {
    return this.configService.get<string>('JWT_PUBLIC_KEY')!.replace(/\\n/g, '\n');
  }

  protected get issuer (): string {
    return this.configService.get<string>('JWT_ISSUER')!;
  }

  protected get frontendUrl (): string {
    return this.configService.get<string>('FRONTEND_URL')!;
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
