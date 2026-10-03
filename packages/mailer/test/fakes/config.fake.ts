import type { ConfigService } from '@nestjs/config';

import { MAILER_TEST as T } from '../constants/mailer.constant';
import { ConfigFakeDto } from '../interfaces/config-fake.interface';

export const aConfigService = ({ settings }: ConfigFakeDto): ConfigService =>
  ({ get: (key: string) => settings[key] ?? (key === T.FROM_KEY ? T.FROM : undefined) }) as unknown as ConfigService;
