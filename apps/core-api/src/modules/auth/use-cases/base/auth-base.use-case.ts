import { Inject, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseAdapter, EmailTemplateType, OutboxDestination, OutboxRepository, SendEmailDto, SessionService } from '@common/libs';

export abstract class AuthBaseUseCase<TInput, TOutput> {
  @Inject(ConfigService)
  protected readonly configService!: ConfigService;

  @Inject(SessionService)
  protected readonly sessionService!: SessionService;

  @Inject(OutboxRepository)
  protected readonly outboxRepository!: OutboxRepository;

  protected get frontendUrl (): string {
    return this.configService.get<string>('FRONTEND_URL')!;
  }

  protected abstract execute(input: TInput): Promise<TOutput>;

  protected async publishEmailVerification (eventPayload: SendEmailDto, userId: string, adapter?: DatabaseAdapter): Promise<SendEmailDto> {
    await this.recordEmailEvent({ eventType: EmailTemplateType.EMAIL_VERIFICATION, eventPayload, userId, ...(adapter && { adapter }) });
    return eventPayload;
  }

  protected async publishPasswordReset (eventPayload: SendEmailDto, userId: string, adapter?: DatabaseAdapter): Promise<SendEmailDto> {
    await this.recordEmailEvent({ eventType: EmailTemplateType.PASSWORD_RESET, eventPayload, userId, ...(adapter && { adapter }) });
    return eventPayload;
  }

  protected extractBearerToken (authorization?: string): string {
    if (!authorization?.startsWith('Bearer ')) throw new UnauthorizedException('Missing or invalid Authorization header');

    const token = authorization.slice(7).trim();
    if (!token) throw new UnauthorizedException('Missing session token');

    return token;
  }

  private async recordEmailEvent ({
    eventType,
    eventPayload,
    userId,
    adapter
  }: {
    eventType: EmailTemplateType;
    eventPayload: SendEmailDto;
    userId: string;
    adapter?: DatabaseAdapter;
  }): Promise<void> {
    await this.outboxRepository.createEvent({
      aggregateType: 'User',
      aggregateId: userId,
      eventType,
      payload: { ...eventPayload },
      destination: OutboxDestination.KAFKA,
      ...(adapter && { adapter })
    });
  }
}
