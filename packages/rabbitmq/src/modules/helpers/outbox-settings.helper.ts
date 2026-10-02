import { RABBITMQ_CONSTANTS } from '../constants/messaging/rabbitmq.constant';
import { OUTBOX_SETTINGS } from '../constants/outbox/outbox-settings.constant';
import { OutboxSettingsDto } from '../dtos/outbox/outbox-settings.dto';
import { OutboxSettingsSourceDto } from '../dtos/outbox/outbox-settings-source.dto';
import { OutboxSettingReadDto } from '../dtos/outbox/outbox-setting-read.dto';

export class OutboxSettingsHelper {
  static from ({ configService }: OutboxSettingsSourceDto): OutboxSettingsDto {
    const source = { ...(configService && { configService }) };

    return {
      batchSize: OutboxSettingsHelper.read({ ...source, key: OUTBOX_SETTINGS.BATCH_SIZE_ENV, fallback: RABBITMQ_CONSTANTS.OUTBOX_BATCH_SIZE.key }),
      pollIntervalMs: OutboxSettingsHelper.read({
        ...source,
        key: OUTBOX_SETTINGS.POLL_INTERVAL_ENV,
        fallback: RABBITMQ_CONSTANTS.OUTBOX_POLL_INTERVAL_MS.key
      })
    };
  }

  private static read ({ configService, key, fallback }: OutboxSettingReadDto): number {
    const value = Number(configService?.get<string | number>(key));
    return Number.isInteger(value) && value > 0 ? value : fallback;
  }
}
