import { Inject, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailTemplateType, OutboxDestination, OutboxRepository, RefreshService, SendEmailDto, SessionService } from '@common/libs';

import { PublishUserEmailDto, RecordEmailEventDto, EmailLinkHelper } from '../../../email';
import { FRONTEND } from '../../../../shared/constants/config/frontend.constant';

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
    return this.configService.get<string>(FRONTEND.URL_KEY)!;
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
      payload: EmailLinkHelper.seal({ payload: eventPayload, key: EmailLinkHelper.keyFrom({ configService: this.configService }) }),
      destination: OutboxDestination.KAFKA,
      ...(adapter && { adapter })
    });
  }
}
