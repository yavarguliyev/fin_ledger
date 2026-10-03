import { OutboxSettingsHelper } from '../../src/modules/helpers/outbox-settings.helper';
import { OUTBOX_SETTINGS_TEST as T } from '../constants/outbox-settings.constant';
import { aConfigService } from '../fakes/config.fake';

describe('OutboxSettingsHelper', () => {
  it('keeps today’s 50 events every 5 seconds when nothing is configured', () => {
    expect(OutboxSettingsHelper.from({})).toEqual({ batchSize: T.DEFAULT_BATCH, pollIntervalMs: T.DEFAULT_INTERVAL });
  });

  it('reads both settings from config, as strings or numbers', () => {
    const configService = aConfigService({ values: { [T.BATCH_KEY]: T.CUSTOM_BATCH, [T.INTERVAL_KEY]: T.CUSTOM_INTERVAL } });

    expect(OutboxSettingsHelper.from({ configService })).toEqual({ batchSize: T.CUSTOM_BATCH_VALUE, pollIntervalMs: T.CUSTOM_INTERVAL });
  });

  it('falls back to the defaults for values that are not positive whole numbers', () => {
    const configService = aConfigService({ values: { [T.BATCH_KEY]: T.INVALID, [T.INTERVAL_KEY]: T.NEGATIVE } });

    expect(OutboxSettingsHelper.from({ configService })).toEqual({ batchSize: T.DEFAULT_BATCH, pollIntervalMs: T.DEFAULT_INTERVAL });
  });
});
