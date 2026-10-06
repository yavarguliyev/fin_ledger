import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BackgroundTask, BackgroundWorker, BaseHelper, PostgresService, ProcessRole } from '@common/libs';
import { TaskHandler, TaskQueueService, TaskRegistry, TaskSchedulerService } from '@common/tasks';

import { RETENTION } from '../constants/retention.constant';
import { RetentionResultDto } from '../dtos/job/retention-result.dto';

@Injectable()
@BackgroundWorker({ role: ProcessRole.WORKER })
export class RetentionJob implements BackgroundTask, TaskHandler {
  private readonly logger = new Logger(RetentionJob.name);
  private readonly intervalMs: number;
  private readonly outboxDays: number;
  private readonly webhookDays: number;
  private readonly notificationDays: number;
  private readonly loginEventDays: number;
  private running = false;
  private stopped = false;

  constructor (
    configService: ConfigService,
    private readonly postgresService: PostgresService,
    private readonly registry: TaskRegistry,
    private readonly scheduler: TaskSchedulerService,
    private readonly taskQueue: TaskQueueService
  ) {
    this.intervalMs = configService.get<number>(RETENTION.INTERVAL_KEY) ?? RETENTION.DEFAULT_INTERVAL_MS;
    this.outboxDays = configService.get<number>(RETENTION.OUTBOX_DAYS_KEY) ?? RETENTION.DEFAULT_OUTBOX_DAYS;
    this.webhookDays = configService.get<number>(RETENTION.WEBHOOK_DAYS_KEY) ?? RETENTION.DEFAULT_WEBHOOK_DAYS;
    this.notificationDays = configService.get<number>(RETENTION.NOTIFICATION_DAYS_KEY) ?? RETENTION.DEFAULT_NOTIFICATION_DAYS;
    this.loginEventDays = configService.get<number>(RETENTION.LOGIN_EVENT_DAYS_KEY) ?? RETENTION.DEFAULT_LOGIN_EVENT_DAYS;
    this.registry.register({ name: RETENTION.TASK_NAME, handler: this });
  }

  start (): void {
    this.stopped = false;
    this.scheduler.schedule({
      name: RETENTION.TASK_NAME,
      everyMs: this.intervalMs,
      run: () => this.taskQueue.enqueue({ name: RETENTION.TASK_NAME, dedupeKey: RETENTION.TASK_NAME }).then(() => undefined)
    });
  }

  stop (): void {
    this.stopped = true;
  }

  async handle (): Promise<void> {
    await this.tick();
  }

  async prune (): Promise<RetentionResultDto> {
    const connection = this.postgresService.getConnection();
    const outbox = await connection.query({ sql: RETENTION.DELETE_OUTBOX_SQL, params: [this.outboxDays] });
    const webhooks = await connection.query({ sql: RETENTION.DELETE_WEBHOOKS_SQL, params: [this.webhookDays] });
    const notifications = await connection.query({ sql: RETENTION.DELETE_NOTIFICATIONS_SQL, params: [this.notificationDays] });
    const logins = await connection.query({ sql: RETENTION.DELETE_LOGIN_EVENTS_SQL, params: [this.loginEventDays] });
    return { outboxEvents: outbox.rowCount, webhookEvents: webhooks.rowCount, notifications: notifications.rowCount, loginEvents: logins.rowCount };
  }

  private async tick (): Promise<void> {
    if (this.stopped || this.running) return;

    this.running = true;

    try {
      const pruned = await this.prune();
      if (Object.values(pruned).some(count => count > 0)) this.logger.log(`Retention removed ${JSON.stringify(pruned)}`);
    } catch (error) {
      this.logger.warn(`Retention pass skipped: ${BaseHelper.errorResponse({ error }).message}`);
    } finally {
      this.running = false;
    }
  }
}
