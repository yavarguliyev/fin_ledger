import type { ConfigService } from '@nestjs/config';

import { ConfigFakeDto } from '../interfaces/config-fake.interface';

export const aConfigService = ({ settings }: ConfigFakeDto): ConfigService => ({ get: (key: string) => settings[key] }) as unknown as ConfigService;
