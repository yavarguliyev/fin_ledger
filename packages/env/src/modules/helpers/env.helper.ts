import { InternalServerErrorException } from '@nestjs/common';
import { z } from 'zod';

import { EnvironmentVariablesDto, EnvironmentVariablesSchema } from '../dtos/config/environment-variables.dto';
import { ValidateConfigDto } from '../dtos/helper/validate-config.dto';

export class ConfigValidator {
  static validate ({ config }: ValidateConfigDto): EnvironmentVariablesDto {
    const result = EnvironmentVariablesSchema.safeParse(config);

    if (!result.success) {
      const errorMessages = result.error.issues
        .map((err: z.core.$ZodIssue) => `- property ${err.path.join('.')} has failed: ${err.message}`)
        .join('\n');

      throw new InternalServerErrorException(`Config validation failed:\n${errorMessages}`);
    }

    return result.data;
  }
}
