import { Injectable, Logger, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseHelper, PostgresService, RequestScope } from '@common/libs';

import { RETENTION } from '../constants/retention.constant';
import { RetentionResultDto } from '../dtos/job/retention-result.dto';

@Injectable()
export class RetentionJob implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(RetentionJob.name);
  private readonly intervalMs: number;
  private readonly outboxDays: number;
  private readonly webhookDays: number;
  private intervalHandle: ReturnType<typeof setInterval> | null = null;
  private running = false;

  constructor (
    configService: ConfigService,
    private readonly postgresService: PostgresService
  ) {
    this.intervalMs = configService.get<number>('RETENTION_INTERVAL_MS') ?? RETENTION.DEFAULT_INTERVAL_MS;
    this.outboxDays = configService.get<number>('RETENTION_OUTBOX_DAYS') ?? RETENTION.DEFAULT_OUTBOX_DAYS;
    this.webhookDays = configService.get<number>('RETENTION_WEBHOOK_DAYS') ?? RETENTION.DEFAULT_WEBHOOK_DAYS;
  }

  onApplicationBootstrap (): void {
    this.intervalHandle = setInterval(() => void RequestScope.runSystem(() => this.tick()), this.intervalMs);
    this.intervalHandle.unref();
  }

  onModuleDestroy (): void {
    if (this.intervalHandle) clearInterval(this.intervalHandle);
    this.intervalHandle = null;
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
