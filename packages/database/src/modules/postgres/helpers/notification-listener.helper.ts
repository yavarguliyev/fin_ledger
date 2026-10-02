import { Logger } from '@nestjs/common';
import { Client } from 'pg';
import { BaseHelper } from '@common/shared-libs';

import { NOTIFY } from '../../constants/notify/notify.constant';
import { NotificationListenerOptionsDto } from '../../dtos/notify/notification-listener-options.dto';
import { ListenerRetryDto } from '../../dtos/notify/listener-retry.dto';
import { PoolHelper } from './pool.helper';

export class NotificationListener {
  private readonly logger = new Logger(NotificationListener.name);
  private client: Client | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private stopped = false;

  constructor (private readonly options: NotificationListenerOptionsDto) {
    if (!NOTIFY.CHANNEL_PATTERN.test(options.channel)) throw new Error(NOTIFY.INVALID_CHANNEL);
  }

  async start (): Promise<void> {
    if (this.stopped) return;
    const { host, port, user, password, database, ssl } = PoolHelper.buildConfig({ config: this.options.config });
    const client = new Client({ host, port, user, password, database, ssl });

    client.on(NOTIFY.NOTIFICATION_EVENT, () => this.options.onNotify());
    client.on(NOTIFY.ERROR_EVENT, error => this.retry({ reason: BaseHelper.errorResponse({ error }).message }));
    client.on(NOTIFY.END_EVENT, () => this.retry({ reason: NOTIFY.END_EVENT }));

    try {
      await client.connect();
      await client.query(`${NOTIFY.LISTEN}${this.options.channel}`);
      this.client = client;
    } catch (error) {
      this.retry({ reason: BaseHelper.errorResponse({ error }).message });
    }
  }

  async stop (): Promise<void> {
    this.stopped = true;
    if (this.timer) clearTimeout(this.timer);
    const client = this.client;
    this.client = null;
    await client?.end().catch(() => undefined);
  }

  private retry ({ reason }: ListenerRetryDto): void {
    if (this.stopped || this.timer) return;
    this.logger.warn(`LISTEN ${this.options.channel} lost (${reason}); reconnecting`);
    this.client = null;
    this.timer = setTimeout(() => {
      this.timer = null;
      void this.start();
    }, NOTIFY.RECONNECT_MS);
  }
}
