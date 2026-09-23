import { Injectable, Logger, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseHelper, WebhookStatus , RequestScope } from '@common/libs';

import { WebhookService } from '../webhook.service';
import { WebhookEventRepository } from '../repositories/webhook-event.repository';
import { ReplayWebhookEventDto } from '../dtos/step/replay-webhook-event.dto';
import { WEBHOOK_REPLAY } from '../constants/jobs/webhook-replay.constant';

@Injectable()
export class WebhookReplayJob implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(WebhookReplayJob.name);
  private readonly intervalMs: number;
  private readonly staleAfterMs: number;
  private intervalHandle: ReturnType<typeof setInterval> | null = null;
  private running = false;
  private stopped = false;

  constructor (
    configService: ConfigService,
    private readonly webhookEventRepository: WebhookEventRepository,
    private readonly webhookService: WebhookService
  ) {
    this.intervalMs = configService.get<number>('WEBHOOK_REPLAY_INTERVAL_MS') ?? WEBHOOK_REPLAY.DEFAULT_INTERVAL_MS;
    this.staleAfterMs = configService.get<number>('WEBHOOK_REPLAY_STALE_AFTER_MS') ?? WEBHOOK_REPLAY.DEFAULT_STALE_AFTER_MS;
  }

  onApplicationBootstrap (): void {
    this.intervalHandle = setInterval(() => void RequestScope.runSystem(() => this.tick()), this.intervalMs);
    this.intervalHandle.unref();
  }

  onModuleDestroy (): void {
    this.stopped = true;

    if (this.intervalHandle) clearInterval(this.intervalHandle);
    this.intervalHandle = null;
  }

  async replayStuckEvents (): Promise<void> {
    const events = await this.webhookEventRepository.findStuck({
      receivedBefore: new Date(Date.now() - this.staleAfterMs).toISOString(),
      maxAttempts: WEBHOOK_REPLAY.MAX_ATTEMPTS,
      limit: WEBHOOK_REPLAY.BATCH_SIZE
    });

    for (const event of events) {
      if (this.stopped) return;
      await this.replay({ event });
    }
  }

  private async tick (): Promise<void> {
    if (this.stopped || this.running) return;

    this.running = true;

    try {
      await this.replayStuckEvents();
    } catch (error) {
      this.logger.warn(`Webhook replay skipped: ${BaseHelper.errorResponse({ error }).message}`);
    } finally {
      this.running = false;
    }
  }

  private async replay ({ event }: ReplayWebhookEventDto): Promise<void> {
    await this.webhookService.replayEvent({ event }).catch(async (error: unknown) => {
      const attempts = (event.attempts ?? 0) + 1;
      this.logger.warn(`Webhook ${event.provider}:${event.eventId} replay ${attempts} failed: ${BaseHelper.errorResponse({ error }).message}`);
      if (attempts >= WEBHOOK_REPLAY.MAX_ATTEMPTS) await this.webhookEventRepository.markHandled({ id: event.id, status: WebhookStatus.FAILED });
    });
  }
}
