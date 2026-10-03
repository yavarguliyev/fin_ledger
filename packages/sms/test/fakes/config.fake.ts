import type { ConfigService } from '@nestjs/config';

import { ConfigFakeDto } from '../interfaces/fakes.interface';

export const aConfigService = ({ values }: ConfigFakeDto): ConfigService => ({ get: (key: string) => values[key] }) as unknown as ConfigService;
