import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BackgroundTask, BackgroundWorker, BaseHelper, ProcessRole, WebhookStatus } from '@common/libs';
import { TaskHandler, TaskQueueService, TaskRegistry, TaskSchedulerService } from '@common/tasks';

import { WebhookService } from '../webhook.service';
import { WebhookEventRepository } from '../repositories/webhook-event.repository';
import { ReplayWebhookEventDto } from '../dtos/step/replay-webhook-event.dto';
import { WEBHOOK_REPLAY } from '../constants/jobs/webhook-replay.constant';

@Injectable()
@BackgroundWorker({ role: ProcessRole.WORKER })
export class WebhookReplayJob implements BackgroundTask, TaskHandler {
  private readonly logger = new Logger(WebhookReplayJob.name);
  private readonly intervalMs: number;
  private readonly staleAfterMs: number;
  private running = false;
  private stopped = false;

  constructor (
    configService: ConfigService,
    private readonly webhookEventRepository: WebhookEventRepository,
    private readonly webhookService: WebhookService,
    private readonly registry: TaskRegistry,
    private readonly scheduler: TaskSchedulerService,
    private readonly taskQueue: TaskQueueService
  ) {
    this.intervalMs = configService.get<number>('WEBHOOK_REPLAY_INTERVAL_MS') ?? WEBHOOK_REPLAY.DEFAULT_INTERVAL_MS;
    this.staleAfterMs = configService.get<number>('WEBHOOK_REPLAY_STALE_AFTER_MS') ?? WEBHOOK_REPLAY.DEFAULT_STALE_AFTER_MS;
    this.registry.register({ name: WEBHOOK_REPLAY.TASK_NAME, handler: this });
  }

  start (): void {
    this.stopped = false;
    this.scheduler.schedule({
      name: WEBHOOK_REPLAY.TASK_NAME,
      everyMs: this.intervalMs,
      run: () => this.taskQueue.enqueue({ name: WEBHOOK_REPLAY.TASK_NAME, dedupeKey: WEBHOOK_REPLAY.TASK_NAME }).then(() => undefined)
    });
  }

  stop (): void {
    this.stopped = true;
  }

  async handle (): Promise<void> {
    await this.tick();
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
