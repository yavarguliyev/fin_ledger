import { InternalServerErrorException } from '@nestjs/common';
import { UnknownRecord } from '@common/shared-libs';
import { z } from 'zod';

import { EnvironmentVariablesSchema, EnvironmentVariables } from '../schemas/env.schema';

export const validate = (config: UnknownRecord): EnvironmentVariables => {
  const result = EnvironmentVariablesSchema.safeParse(config);

  if (!result.success) {
    const errorMessages = result.error.issues
      .map((err: z.core.$ZodIssue) => `- property ${err.path.join('.')} has failed: ${err.message}`)
      .join('\n');

    throw new InternalServerErrorException(`Config validation failed:\n${errorMessages}`);
  }

  return result.data;
};
