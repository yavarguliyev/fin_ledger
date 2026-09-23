import { Module } from '@nestjs/common';

import { RetentionJob } from './jobs/retention.job';

@Module({
  providers: [RetentionJob],
  exports: [RetentionJob]
})
export class RetentionModule {}
