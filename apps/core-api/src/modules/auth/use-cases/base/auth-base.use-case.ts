import { Inject, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailTemplateType, OutboxDestination, OutboxRepository, RefreshService, SendEmailDto, SessionService } from '@common/libs';

import { PublishUserEmailDto } from '../../../email/dtos/step/publish-user-email.dto';
import { RecordEmailEventDto } from '../../../email/dtos/step/record-email-event.dto';

export abstract class AuthBaseUseCase<TInput, TOutput> {
  @Inject(ConfigService)
  protected readonly configService!: ConfigService;

  @Inject(SessionService)
  protected readonly sessionService!: SessionService;

  @Inject(RefreshService)
  protected readonly refreshService!: RefreshService;

  @Inject(OutboxRepository)
  protected readonly outboxRepository!: OutboxRepository;

  protected get frontendUrl (): string {
    return this.configService.get<string>('FRONTEND_URL')!;
  }

  protected abstract execute(input: TInput): Promise<TOutput>;

  protected async publishEmailVerification (dto: PublishUserEmailDto): Promise<SendEmailDto> {
    await this.recordEmailEvent({ ...dto, eventType: EmailTemplateType.EMAIL_VERIFICATION });
    return dto.eventPayload;
  }

  protected async publishAccountEmail (dto: RecordEmailEventDto): Promise<void> {
    await this.recordEmailEvent(dto);
  }

  protected async publishPasswordReset (dto: PublishUserEmailDto): Promise<SendEmailDto> {
    await this.recordEmailEvent({ ...dto, eventType: EmailTemplateType.PASSWORD_RESET });
    return dto.eventPayload;
  }

  protected extractBearerToken (authorization?: string): string {
    if (!authorization?.startsWith('Bearer ')) throw new UnauthorizedException('Missing or invalid Authorization header');
    const token = authorization.slice(7).trim();
    if (!token) throw new UnauthorizedException('Missing session token');
    return token;
  }

  private async recordEmailEvent ({ eventType, eventPayload, userId, adapter }: RecordEmailEventDto): Promise<void> {
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
