import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseHelper, PostgresService } from '@common/libs';
import { TaskHandler, TaskQueueService, TaskRegistry, TaskSchedulerService } from '@common/tasks';

import { RETENTION } from '../constants/retention.constant';
import { RetentionResultDto } from '../dtos/job/retention-result.dto';

@Injectable()
export class RetentionJob implements OnApplicationBootstrap, TaskHandler {
  private readonly logger = new Logger(RetentionJob.name);
  private readonly intervalMs: number;
  private readonly outboxDays: number;
  private readonly webhookDays: number;
  private running = false;

  constructor (
    configService: ConfigService,
    private readonly postgresService: PostgresService,
    private readonly registry: TaskRegistry,
    private readonly scheduler: TaskSchedulerService,
    private readonly taskQueue: TaskQueueService
  ) {
    this.intervalMs = configService.get<number>('RETENTION_INTERVAL_MS') ?? RETENTION.DEFAULT_INTERVAL_MS;
    this.outboxDays = configService.get<number>('RETENTION_OUTBOX_DAYS') ?? RETENTION.DEFAULT_OUTBOX_DAYS;
    this.webhookDays = configService.get<number>('RETENTION_WEBHOOK_DAYS') ?? RETENTION.DEFAULT_WEBHOOK_DAYS;
  }

  onApplicationBootstrap (): void {
    this.registry.register({ name: RETENTION.TASK_NAME, handler: this });

    this.scheduler.schedule({
      name: RETENTION.TASK_NAME,
      everyMs: this.intervalMs,
      run: () => this.taskQueue.enqueue({ name: RETENTION.TASK_NAME, dedupeKey: RETENTION.TASK_NAME }).then(() => undefined)
    });
  }

  async handle (): Promise<void> {
    await this.tick();
  }

  async prune (): Promise<RetentionResultDto> {
    const connection = this.postgresService.getConnection();
    const outbox = await connection.query({ sql: RETENTION.DELETE_OUTBOX_SQL, params: [this.outboxDays] });
    const webhooks = await connection.query({ sql: RETENTION.DELETE_WEBHOOKS_SQL, params: [this.webhookDays] });
    return { outboxEvents: outbox.rowCount, webhookEvents: webhooks.rowCount };
  }

  private async tick (): Promise<void> {
    if (this.running) return;

    this.running = true;

    try {
      const pruned = await this.prune();
      if (pruned.outboxEvents || pruned.webhookEvents) {
        this.logger.log(`Retention removed ${pruned.outboxEvents} outbox and ${pruned.webhookEvents} webhook row(s)`);
      }
    } catch (error) {
      this.logger.warn(`Retention pass skipped: ${BaseHelper.errorResponse({ error }).message}`);
    } finally {
      this.running = false;
    }
  }
}
