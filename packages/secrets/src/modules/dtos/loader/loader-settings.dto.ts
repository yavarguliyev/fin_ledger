import { z } from 'zod';

import { AwsConnectionSchema } from '../config/aws-connection.dto';
import { ConfigReaderSchema } from './config-reader.dto';

export const LoaderSettingsSchema = ConfigReaderSchema.extend({
  connection: AwsConnectionSchema
});

export type LoaderSettingsDto = z.infer<typeof LoaderSettingsSchema>;
